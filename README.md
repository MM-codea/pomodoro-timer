<p align="center">
  <img src="public/tomato-icon.svg" width="80" alt="番茄钟" />
</p>

<h1 align="center">番茄钟</h1>

<p align="center">用专注赢得时间</p>

<div align="center">

![Platform](https://img.shields.io/badge/platform-Windows-blue?logo=windows)
![Vue](https://img.shields.io/badge/Vue-3.5-4FC08D?logo=vuedotjs)
![Electron](https://img.shields.io/badge/Electron-34-47848F?logo=electron)
![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6?logo=typescript)
![License](https://img.shields.io/badge/license-MIT-green)

</div>

---

## ✨ 特性

- 🍅 **番茄工作法** — 专注 / 短休息 / 长休息 三阶段循环，四轮后自动长休息
- ⭕ **精美环形计时器** — 呼吸光晕动画，模式色随状态自然过渡
- 🌓 **亮色 / 暗色主题** — 跟随系统自动切换，护眼舒适
- 📊 **数据分析** — 每日柱状图、日历热力图、周报对比，专注数据一目了然
- 📈 **汇总卡片** — 本月番茄、总时长、连续天数、日均番茄四维统计
- 🔔 **系统通知** — Windows Toast 通知 + 提示音，番茄完成不遗漏
- 📌 **窗口置顶** — 可选常驻桌面，不打断工作流
- ⚙️ **灵活配置** — 自定义专注/休息时长、长休息间隔、提示音开关
- ↩️ **撤销机制** — 误触后 10 秒内可撤销，数据准确有保障
- 🖥️ **系统托盘** — 最小化到托盘，右键菜单快捷控制

## 🎨 界面

| 计时页面 | 统计页面 |
|---|---|
| 大型环形进度条 + 呼吸光晕动画 | 汇总卡片 + 柱状图 + 热力图 + 周报 |

## 🛠 技术栈

| 层 | 技术 |
|---|---|
| 桌面框架 | Electron 34 |
| 前端框架 | Vue 3（Composition API） |
| 状态管理 | Pinia |
| UI 组件库 | Naive UI |
| 图表 | ECharts 6 + vue-echarts |
| 图标 | IonIcons 5 |
| 构建 | Vite 6 + vite-plugin-electron |
| 语言 | TypeScript 5（strict） |
| 持久化 | electron-store |
| 打包 | electron-builder（NSIS） |

## 📦 快速开始

```bash
# 安装依赖
npm install

# 开发模式（Vite HMR + Electron）
npm run dev

# 生产构建
npm run build

# 打包为目录
npm run pack

# 打包为安装包
npm run dist
```

## 📁 项目结构

```
pomodoro-timer/
├── electron/                # 主进程（Node.js）
│   ├── main.ts              # 窗口管理、IPC、生命周期
│   ├── timer-engine.ts      # 纯状态机：idle → running → paused
│   ├── settings-store.ts    # 持久化：设置、历史记录（electron-store）
│   ├── tray-manager.ts      # 系统托盘 + 右键菜单
│   ├── notification.ts      # Windows 通知 + 提示音
│   ├── preload.ts           # contextBridge 暴露安全 API
│   └── shared-types.ts      # 主进程/渲染进程共享类型
├── src/                     # 渲染进程（Vue 3）
│   ├── main.ts              # Vue 入口
│   ├── App.vue              # 根组件：主题 + Tab + 背景联动
│   ├── components/          # UI 组件
│   │   ├── TimerCircle.vue  # SVG 环形进度（签名元素）
│   │   ├── TimerControls.vue # 播放/暂停/重置/跳过
│   │   ├── SessionInfo.vue  # 今日番茄计数 + 周期进度
│   │   ├── SettingsPanel.vue # 设置抽屉
│   │   ├── StatsView.vue    # 统计页容器（懒加载）
│   │   ├── SummaryCards.vue # 2×2 汇总卡片
│   │   ├── DailyChart.vue   # 每日柱状图（7/14/30 天）
│   │   ├── CalendarHeatmap.vue # 日历热力图
│   │   └── WeekCompare.vue  # 本周 vs 上周对比
│   ├── stores/              # Pinia 状态管理
│   └── composables/         # 组合式函数
├── public/                  # 静态资源
└── resources/               # electron-builder 资源
```

## 🏗 架构

- **主进程**是唯一真相来源 — 计时器在主进程运行，每秒推送到渲染进程
- **渲染进程**镜像状态，通过 IPC 发送控制指令（三种模式：fire-and-forget / request-response / push）
- **统计页懒加载** — ECharts 按需挂载，避免隐藏 DOM 初始化错误
- **浅拷贝守卫** — Pinia Proxy 对象通过 IPC 传输前自动拷贝为纯对象

## 📄 License

MIT © MengZQ
