# 💎 珠宝塔罗 · Jewelry Tarot

以宝石之光，观命运之道

一款以珠宝首饰为主题的塔罗牌抽卡程序，将 22 张大阿尔卡那与珍贵宝石一一对应，通过随机抽卡为你揭示命运的密语。

---

## ✨ 特色功能

- **完全随机抽卡** — Fisher-Yates 洗牌算法，每次占卜结果真正随机
- **逆位系统** — 约 35% 概率出现逆位牌，每张牌有正逆两套解读
- **三种首饰牌阵**：
  | 牌阵 | 张数 | 主题 |
  |------|------|------|
  | 💍 戒指占卜 | 1 张 | 当下洞察，聚焦单一问题 |
  | 📿 项链占卜 | 3 张 | 过去・现在・未来 |
  | 👑 王冠占卜 | 10 张 | 凯尔特十字，全局深度解读 |
- **宝石对应** — 每张牌与一块珍贵宝石关联（参考 GemSelect）
- **中文详细牌义** — 正位 + 逆位完整解读，关键词标签
- **优雅视觉设计** — 深紫金色珠宝主题，3D 翻牌动画，星空背景

---

## 🗂️ 仓库结构

```
.
├── static/
│   └── index.html          # 静态版本（单文件，可直接部署 GitHub Pages）
├── app/                    # React + Vite 完整应用
│   ├── package.json
│   ├── vite.config.js
│   ├── index.html
│   └── src/
│       ├── main.jsx
│       ├── App.jsx
│       ├── App.css
│       ├── data/
│       │   └── tarotCards.js   # 22 张大阿尔卡那数据
│       └── components/
│           ├── TarotCard.jsx
│           └── CardModal.jsx
└── .github/
    └── workflows/
        └── deploy.yml      # 自动部署到 GitHub Pages
```

---

## 🚀 快速开始

### 方式一：直接打开静态版本

用浏览器打开 `static/index.html`，无需任何依赖即可使用。

### 方式二：运行 React 应用

```bash
cd app
npm install
npm run dev
```

浏览器访问 `http://localhost:5173`

### 方式三：部署到 GitHub Pages

1. 将本仓库 push 到 GitHub
2. 在 Settings → Pages 中启用 GitHub Actions 部署
3. GitHub Actions 将自动构建并部署

部署完成后：
- 根路径 `/` → 静态版本（即开即用）
- `/app/` → React 完整版本

---

## 📖 塔罗知识来源

- **牌义参考**：[Biddy Tarot](https://biddytarot.com)、[Labyrinthos](https://labyrinthos.co)
- **宝石对应**：[GemSelect – Tarot Cards & Gemstones](https://www.gemselect.com/other-info/tarot-cards-and-gemstones.php)
- **凯尔特十字牌阵**：[Biddy Tarot – Celtic Cross Guide](https://biddytarot.com/blog/how-to-read-the-celtic-cross-tarot-spread/)
- **牌面图像**：Rider-Waite 塔罗牌（公版，来自 Wikimedia Commons）

---

## 💎 宝石对应一览

| 牌 | 宝石 | 含义 |
|----|------|------|
| 0 愚者 | 玛瑙 | 纯净与新生 |
| I 魔法师 | 火欧泊 | 意志与创造力 |
| II 女祭司 | 月光石 | 直觉与神秘 |
| III 女皇 | 橄榄石 | 丰饶与生命力 |
| IV 皇帝 | 红宝石 | 力量与权威 |
| V 教皇 | 黄玉 | 智慧与精神 |
| VI 恋人 | 玫瑰石英 | 爱与感情 |
| VII 战车 | 红玉髓 | 热情与前进 |
| VIII 力量 | 虎眼石 | 勇气与韧性 |
| IX 隐者 | 血石 | 沉思与内省 |
| X 命运之轮 | 东陵玉 | 好运与循环 |
| XI 正义 | 石榴石 | 公正与因果 |
| XII 倒吊人 | 海蓝宝 | 平静与转化 |
| XIII 死神 | 黑曜石 | 转化与保护 |
| XIV 节制 | 紫水晶 | 平和与调和 |
| XV 恶魔 | 赤铁矿 | 保护与净化 |
| XVI 塔 | 蓝晶石 | 能量与清明 |
| XVII 星星 | 舒俱来石 | 希望与灵性 |
| XVIII 月亮 | 珍珠 | 神秘与直觉 |
| XIX 太阳 | 日长石 | 阳光与能量 |
| XX 审判 | 孔雀石 | 觉醒与重生 |
| XXI 世界 | 萤石 | 圆满与和谐 |

---

*塔罗牌仅供娱乐与自我探索，不构成任何专业建议。*
