import { useEffect, useRef, useState, useCallback } from 'react'
import { HandLandmarker, FilesetResolver } from '@mediapipe/tasks-vision'

// Landmark indices
const THUMB_TIP = 4
const INDEX_TIP = 8
const MIDDLE_TIP = 12
const WRIST = 0
const INDEX_MCP = 5

// Gesture detection thresholds
const PINCH_THRESHOLD = 0.07   // normalized distance for pinch
const WAVE_VELOCITY = 0.04     // wrist x-velocity for wave
const PINCH_HOLD_MS = 600      // hold pinch this long to trigger draw
const COOLDOWN_MS = 1500       // ms between gesture triggers

function dist2D(a, b) {
  return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2)
}

function isOpenHand(landmarks) {
  // Rough check: index, middle fingertips are above their MCPs (y is flipped in image coords)
  return (
    landmarks[INDEX_TIP].y < landmarks[INDEX_MCP].y - 0.05 &&
    landmarks[MIDDLE_TIP].y < landmarks[5].y - 0.05
  )
}

export default function GestureCamera({ onDraw, onReset, canDraw, drawn }) {
  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const landmarkerRef = useRef(null)
  const animFrameRef = useRef(null)
  const lastVideoTimeRef = useRef(-1)
  const pinchStartRef = useRef(null)
  const wristHistRef = useRef([])       // [{x, t}] for wave detection
  const lastGestureRef = useRef(0)      // timestamp of last triggered gesture

  const [active, setActive] = useState(false)
  const [loading, setLoading] = useState(false)
  const [gesture, setGesture] = useState(null)   // 'pinch' | 'wave' | null
  const [pinchProgress, setPinchProgress] = useState(0) // 0–1

  // Initialize HandLandmarker
  const initLandmarker = useCallback(async () => {
    if (landmarkerRef.current) return
    const vision = await FilesetResolver.forVisionTasks(
      'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm'
    )
    landmarkerRef.current = await HandLandmarker.createFromOptions(vision, {
      baseOptions: {
        modelAssetPath:
          'https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task',
        delegate: 'GPU',
      },
      runningMode: 'VIDEO',
      numHands: 1,
    })
  }, [])

  // Start camera + detection loop
  const startCamera = useCallback(async () => {
    setLoading(true)
    try {
      await initLandmarker()
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 320, height: 240, facingMode: 'user' },
      })
      videoRef.current.srcObject = stream
      await videoRef.current.play()
      setActive(true)
    } catch (err) {
      console.error('Camera error:', err)
      alert('无法访问摄像头，请确认浏览器权限。')
    } finally {
      setLoading(false)
    }
  }, [initLandmarker])

  // Stop camera
  const stopCamera = useCallback(() => {
    cancelAnimationFrame(animFrameRef.current)
    const stream = videoRef.current?.srcObject
    stream?.getTracks().forEach(t => t.stop())
    if (videoRef.current) videoRef.current.srcObject = null
    setActive(false)
    setGesture(null)
    setPinchProgress(0)
  }, [])

  // Detection loop
  useEffect(() => {
    if (!active) return

    const lm = landmarkerRef.current
    const video = videoRef.current
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')

    const detect = () => {
      animFrameRef.current = requestAnimationFrame(detect)
      if (!video || video.readyState < 2) return

      const now = performance.now()
      if (video.currentTime === lastVideoTimeRef.current) return
      lastVideoTimeRef.current = video.currentTime

      const result = lm.detectForVideo(video, now)

      // Clear canvas
      if (ctx && canvas) {
        canvas.width = video.videoWidth
        canvas.height = video.videoHeight
        ctx.clearRect(0, 0, canvas.width, canvas.height)
      }

      if (!result.landmarks?.length) {
        setGesture(null)
        setPinchProgress(0)
        pinchStartRef.current = null
        return
      }

      const lms = result.landmarks[0]

      // Draw skeleton
      if (ctx && canvas) {
        drawSkeleton(ctx, lms, canvas.width, canvas.height)
      }

      // ─── Pinch detection ───
      const pinchDist = dist2D(lms[THUMB_TIP], lms[INDEX_TIP])
      const isPinching = pinchDist < PINCH_THRESHOLD

      if (isPinching) {
        if (!pinchStartRef.current) pinchStartRef.current = now
        const held = now - pinchStartRef.current
        const progress = Math.min(held / PINCH_HOLD_MS, 1)
        setPinchProgress(progress)
        setGesture('pinch')

        if (progress >= 1 && now - lastGestureRef.current > COOLDOWN_MS) {
          lastGestureRef.current = now
          pinchStartRef.current = null
          setPinchProgress(0)
          if (canDraw) onDraw?.()
        }
      } else {
        pinchStartRef.current = null
        setPinchProgress(0)
      }

      // ─── Wave detection (open hand horizontal swipe) ───
      const wx = lms[WRIST].x
      const wt = now
      wristHistRef.current.push({ x: wx, t: wt })
      // Keep last 400ms
      wristHistRef.current = wristHistRef.current.filter(p => wt - p.t < 400)

      if (!isPinching && wristHistRef.current.length >= 4) {
        const oldest = wristHistRef.current[0]
        const newest = wristHistRef.current[wristHistRef.current.length - 1]
        const dx = Math.abs(newest.x - oldest.x)
        const dt = (newest.t - oldest.t) / 1000  // seconds
        const velocity = dx / dt

        if (velocity > WAVE_VELOCITY && isOpenHand(lms)) {
          if (now - lastGestureRef.current > COOLDOWN_MS) {
            lastGestureRef.current = now
            setGesture('wave')
            if (drawn) onReset?.()
            setTimeout(() => setGesture(null), 800)
          }
        } else if (!isPinching) {
          setGesture(g => g === 'wave' ? g : null)
        }
      }
    }

    animFrameRef.current = requestAnimationFrame(detect)
    return () => cancelAnimationFrame(animFrameRef.current)
  }, [active, canDraw, drawn, onDraw, onReset])

  // Cleanup on unmount
  useEffect(() => () => stopCamera(), [stopCamera])

  return (
    <div className="gesture-panel">
      {/* Toggle button */}
      <button
        className={`gesture-toggle-btn${active ? ' active' : ''}`}
        onClick={active ? stopCamera : startCamera}
        disabled={loading}
        title={active ? '关闭手势控制' : '开启手势控制'}
      >
        {loading ? '⏳' : active ? '🤚 手势控制中' : '🎥 开启手势控制'}
      </button>

      {active && (
        <div className="gesture-view">
          {/* Camera feed */}
          <div className="gesture-camera-wrap">
            <video
              ref={videoRef}
              className="gesture-video"
              playsInline
              muted
            />
            <canvas ref={canvasRef} className="gesture-canvas" />

            {/* Gesture status overlay */}
            <div className={`gesture-status-badge ${gesture || ''}`}>
              {gesture === 'pinch' && (
                <>
                  <span>✌️ 捏合中</span>
                  <div className="pinch-progress-bar">
                    <div
                      className="pinch-progress-fill"
                      style={{ width: `${pinchProgress * 100}%` }}
                    />
                  </div>
                </>
              )}
              {gesture === 'wave' && <span>👋 挥手！</span>}
              {!gesture && <span className="gesture-hint-text">等待手势…</span>}
            </div>
          </div>

          {/* Instructions */}
          <div className="gesture-instructions">
            <div className={`gesture-instr-item${canDraw ? '' : ' disabled'}`}>
              <span className="gi-icon">✌️</span>
              <span>捏合拇指与食指 → <strong>抽牌</strong></span>
            </div>
            <div className={`gesture-instr-item${drawn ? '' : ' disabled'}`}>
              <span className="gi-icon">👋</span>
              <span>张开手掌横扫 → <strong>重新占卜</strong></span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Draw hand skeleton on canvas ────────────────────────────────────────────
const CONNECTIONS = [
  [0,1],[1,2],[2,3],[3,4],
  [0,5],[5,6],[6,7],[7,8],
  [0,9],[9,10],[10,11],[11,12],
  [0,13],[13,14],[14,15],[15,16],
  [0,17],[17,18],[18,19],[19,20],
  [5,9],[9,13],[13,17],
]

function drawSkeleton(ctx, lms, w, h) {
  ctx.strokeStyle = 'rgba(201,168,76,0.8)'
  ctx.lineWidth = 2
  for (const [a, b] of CONNECTIONS) {
    ctx.beginPath()
    ctx.moveTo(lms[a].x * w, lms[a].y * h)
    ctx.lineTo(lms[b].x * w, lms[b].y * h)
    ctx.stroke()
  }
  for (const lm of lms) {
    ctx.beginPath()
    ctx.arc(lm.x * w, lm.y * h, 4, 0, Math.PI * 2)
    ctx.fillStyle = 'rgba(240,208,128,0.9)'
    ctx.fill()
  }
  // Highlight thumb tip and index tip
  for (const idx of [THUMB_TIP, INDEX_TIP]) {
    ctx.beginPath()
    ctx.arc(lms[idx].x * w, lms[idx].y * h, 7, 0, Math.PI * 2)
    ctx.fillStyle = 'rgba(255,80,120,0.9)'
    ctx.fill()
  }
}
