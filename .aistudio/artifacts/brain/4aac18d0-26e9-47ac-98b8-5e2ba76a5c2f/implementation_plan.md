# 次元刻度 · 昼夜手帐双模式、在看智能聚光灯与分集神回手帐升级方案

本次升级围绕「温润手帐 (Washi)」的核心体验，落地**昼夜和纸双生主题（浅色和纸 + 深夜咖啡暗调手帐）**、**在看焦点横幅智能高亮（待补集数、完结冲刺与今日打卡感知）**以及**分集「★ 神回」标记与单集一句话吐槽手帐**三大模块，让每一次追番记录既有深夜放映室的沉浸氛围，又能精准留存每一集的感动瞬间。

---

## User Review & Critical Decisions

> [!IMPORTANT]
> 以下为根据您的选择确认的核心方案决策，审阅通过后将直接进入代码实现与测试验证阶段：

- **Confirmed Decision 1 (UI 视觉升级)**：**昼夜和纸双模式（浅色暖米和纸 `Washi Day` + 深夜咖啡暗调手帐 `Washi Night`）**
  - 在左侧导航栏与顶部工具区提供一键「☀ 日间手帐 / ☕ 深夜咖啡」切换开关，支持记忆用户偏好，并在切换至深夜咖啡模式时自动联动看板娘「刻刻」切换为「夜晚 · 困倦（咖啡夜读）」伴读状态。
- **Confirmed Decision 2 (UX 效率升级)**：**「正在追看」横幅增加今日更新与待补集数智能高亮**
  - 在首页顶部「正在追看」焦点横幅中，自动计算每部在看番剧的**待补集数**、**完结冲刺状态（仅剩 $\le 2$ 集）**、**放送星期匹配（今日更新）**与**今日打卡状态**，支持按「全部在看 / 待补集数 / 完结冲刺」快速筛选切换，并在切换胶囊上直接展示待看集数角标。
- **Confirmed Decision 3 (核心功能扩展)**：**分集「★ 神回」标记与单集一句话吐槽手帐**
  - 支持在作品详情抽屉的每一集（包括未看或已看单集）中一键点亮 **「★ 神回」** 并记录 **「单集一句话吐槽/手帐批注」**；分集格子直接透出金星神回角标与悬停批注预览，详情抽屉内自动汇总「本剧神回与分集手帐摘录」，并在「统计记录」页新增 **「年度神回与单集手帐榜」**。

---

## 1. Overview & Core Concept

- **What It Does**：
  1. 为手帐界面赋予昼夜两种截然不同但同样温润的纸张质感：白昼是米白和纸配朱砂印泥，夜晚是深焙咖啡黑胡桃木色调配暖金与琥珀朱砂，彻底解决夜间追番刺眼问题。
  2. 将首页「正在追看」横幅从静态展示升级为「智能追番聚光灯」，一眼识别哪些番剧今天更新、哪些还差一两集就能完结撒花、哪些囤积了多集待补。
  3. 将手帐记录颗粒度从「整部作品」下沉到「具体单集」，让封神作画回、催泪回或名场面吐槽都能锚定在对应集数格子上，并在统计页与全库导入导出中完整流转。
- **Target Audience / Persona**：热爱记录番剧观感、常在夜晚追番、希望对每一集名场面留下专属印记的动画手帐爱好者。
- **Key Value**：消除夜间视觉疲劳、降低多部番剧并行追看时的记忆负担，并赋予单集打卡更具仪式感的情感留存。

---

## 2. User Experience & Visual Design

### Key User Flows

1. **昼夜和纸一键切换流**：
   - 用户点击左侧边栏底部的主题切换按钮（或顶栏快捷开关），界面在 `180ms` 内平滑过渡至「深夜咖啡暗调手帐 (`washi-night`)」。
   - 右下角看板娘「刻刻」同步弹出咖啡夜读气泡与晚安贴纸，全局卡片、分集网格、抽屉面板、热力图与模态框均切换为深焙咖啡暗色和纸配色。
2. **在看横幅智能聚光灯交互流**：
   - 打开首页时，「正在追看」横幅顶部自动展示智能状态标签：若某部在看番剧匹配今日放送星期，高亮显示 `今日更新`；若剩余未看集数 $\le 2$ 集，高亮显示 `完结冲刺 · 剩 X 集`；若已设总集数且有未看集，显示 `待看 #N（差 M 集）`。
   - 多部在看番剧的切换胶囊按优先级排序（今日更新 / 完结冲刺优先），每个胶囊自带待补集数角标，选中后可一键点击右侧朱砂大印章直接盖章 `+1 集`。
3. **分集「★ 神回」与单集吐槽手帐流**：
   - 在作品详情抽屉的「分集进度」区域，点击任意单集格子展开单集编辑栏，新增 **「★ 标为神回」** 切换按钮与 **「单集一句话手帐吐槽」** 输入框（支持回车快速保存）。
   - 保存后，该集格子右上角点亮暖金色 `★` 徽标（若写有吐槽则底部带有手帐墨迹横线），鼠标悬停即可预览单集标题、观看日期与手帐吐槽；若首次点亮神回，刻刻会弹出「好耶！神回打卡成功！」表情互动。
   - 在分集网格下方自动生成 **「本剧神回与分集手帐摘录」** 列表，集中展示本剧所有带 `★ 神回` 或写有单集吐槽的剧集；进入「统计记录」页还可查看跨作品汇总的 **「神回与心动单集手帐榜」**。

### Visual Identity & Theme

- **Aesthetic Direction**：纸本手帐与深夜咖啡放映室的融合美学（Tactile Editorial Washi & Midnight Espresso Screening Room）。
- **Color Palette & Mood (60-30-10 Discipline)**：
  - **日间暖米和纸 (`data-ui-theme="washi"`)**：
    - 60% 主画布：`#f4efe4`（暖米和纸肌理）
    - 30% 结构表面：`#fffdf8`（手帐内页卡片）与 `#e2d7c3`（细线装订边框）
    - 10% 点缀色：`#b83228`（朱砂印泥红，用于主操作与印章）与 `#c88a2b`（神回暖金星徽）
  - **深夜咖啡暗调手帐 (`data-ui-theme="washi-night"`)**：
    - 60% 主画布：`#161311`（深焙黑咖啡底色，柔和不刺眼）
    - 30% 结构表面：`#211c18`（胡桃木暗调手帐纸面）、`#2a241f`（悬浮表面）与 `#382f28`（暖棕细线边框），正文字色采用 `#ede4d7`（羊皮暖白，对比度 $> 9:1$）
    - 10% 点缀色：`#d4483b`（暖朱砂印章）与 `#e5a93c`（琥珀金，用于神回星标与完结冲刺高亮）
- **Typography & Hierarchy**：
  - 标题与印章文案采用衬线手帐体（`Noto Serif SC` / `Songti SC`），正文采用清晰无衬线体，所有集数、进度百分比、统计时长与日期严格启用 `font-variant-numeric: tabular-nums` 等宽数字对齐。
- **Interactive Feedback & Motion**：
  - 主题切换、分集格子神回点亮、焦点横幅切换均控制在 `160ms` 内完成（仅使用 `transform` 与 `opacity` 合成属性）。

---

## 3. Key Product Decisions & Trade-Offs

- **Decision 1：分集神回与单集吐槽存储在 `episodes` 表并无缝兼容存量 v4 数据库**
  - *Chosen Approach*：在 `episodes` 表上扩充 `is_highlight`（0/1）与 `note`（最多 300 字单集手帐吐槽）两个字段，同时在数据库初始化时通过幂等的列检查自动补齐，并在 `exportLibraryData` / `importLibraryData` 中完整包含这两个字段。
  - *Why*：保证即使单集尚未标记为「已看」（或者取消已看后重看），用户写的单集吐槽与神回标记依然稳固保留在 `episodes` 上不会丢失；同时保持数据库 `user_version = 4` 与现有 150 项自动化测试 100% 兼容。
  - *Alternatives Considered*：仅保存在浏览器 `localStorage` 中——被排除，因为无法跟随 SQLite 物理备份和跨端云同步流转。
- **Decision 2：在看横幅的「今日更新」与「待补集数」采用零额外配额开销的本地推导**
  - *Chosen Approach*：结合库内作品的分集进度（`episode_total - episode_watched`）、最近观看操作时间以及本地已缓存的周历数据匹配放送星期，不额外发起外部 API 请求。
  - *Why*：严格保护用户的弹弹Play API 每日配额，同时确保首页加载零延迟。

---

## 4. Technical Architecture & Data Strategy *(Technical Reference)*

### Architecture & Component Diagram

```
┌───────────────────────────────────────────────────────────────────────────┐
│                         Client UI (Web Application)                       │
│                                                                           │
│  ┌─────────────────────────┐   ┌───────────────────────────────────────┐  │
│  │  Theme & Mascot Engine  │   │  Smart Watching Focus Strip           │  │
│  │  - Washi Day / Night    │──▶│  - Filter: All / Pending / Sprint     │  │
│  │  - Auto Sync Keke Mood  │   │  - Badges: 今日更新 / 剩N集 / 待补#M   │  │
│  └─────────────────────────┘   └───────────────────────────────────────┘  │
│                                                                           │
│  ┌───────────────────────────────────────┐   ┌─────────────────────────┐  │
│  │  Anime Detail Drawer (Episode Block)  │   │  Yearly Stats View      │  │
│  │  - Episode Grid with ★ Highlight Dot  │   │  - Keke Companion Note  │  │
│  │  - Inline Editor: ★ Toggle + Ep Note  │   │  - 年度神回与分集手帐榜 │  │
│  │  - Series Highlight & Note Digest     │   │  - 365-Day Heatmap      │  │
│  └───────────────────┬───────────────────┘   └────────────┬────────────┘  │
└──────────────────────┼────────────────────────────────────┼───────────────┘
                       │ PUT /api/episodes/:id/meta         │ GET /api/stats
                       ▼                                    ▼
┌───────────────────────────────────────────────────────────────────────────┐
│                      Server & SQLite Persistence Layer                    │
│                                                                           │
│  ┌───────────────────────────────────┐   ┌─────────────────────────────┐  │
│  │  episodeService & statsService    │   │  backup / sync / export     │  │
│  │  - updateEpisodeMeta(title,       │   │  - Export & Import includes │  │
│  │    duration, is_highlight, note)  │   │    is_highlight & note      │  │
│  │  - listHighlightedEpisodes()      │   │                             │  │
│  └─────────────────┬─────────────────┘   └──────────────┬──────────────┘  │
│                    ▼                                    ▼                 │
│  ┌─────────────────────────────────────────────────────────────────────┐  │
│  │  SQLite Database (`episodes` table: + `is_highlight`, + `note`)     │  │
│  └─────────────────────────────────────────────────────────────────────┘  │
└───────────────────────────────────────────────────────────────────────────┘
```

### Data Model & State

- **`episodes` 表扩展字段**：
  - `is_highlight INTEGER NOT NULL DEFAULT 0 CHECK (is_highlight IN (0, 1))`：是否标记为「★ 神回」。
  - `note TEXT`：单集一句话吐槽/手帐批注（长度上限 300 字符，空白自动转为 `NULL`）。
- **API 契约扩展**：
  - `PUT /api/episodes/:id/meta`：请求体支持 `{ title, duration_minutes, is_highlight, note }`，支持单独或组合更新，返回更新后的 `episode` 与 `progress`。
  - `GET /api/anime/:id/episodes`：返回的每个 `episodes[]` 元素自带 `is_highlight`（布尔/0-1）与 `note`；`progress` 额外返回 `highlight_count`（本剧神回集数）。
  - `GET /api/stats`：返回的统计对象新增 `highlights` 数组（包含作品 ID、作品标题、封面、季号、集号、单集标题、神回标记、单集吐槽与观看日期），供统计页「神回与心动单集手帐榜」渲染。

### Interactive Component & State Mapping

1. **昼夜手帐主题切换 (`applyUiTheme` & `toggleWashiNightMode`)**：
   - `state.uiTheme` 支持 `'washi'`（日间暖米和纸）与 `'washi-night'`（深夜咖啡暗调手帐）。
   - 侧边栏与顶栏提供一键切换按钮，点击后更新 `document.documentElement.dataset.uiTheme`、持久化至 `localStorage`，并联动 `setMascotMood(theme === 'washi-night' ? 'night' : getDefaultMascotMood())`。
2. **在看横幅智能聚光灯 (`renderWashiFocus`)**：
   - 新增 `state.heroFilter`（`'all'` | `'pending'` | `'sprint'`）。
   - 对每部 `watching` 作品推导智能状态：`isSprint`（`tot > 0 && tot - watched <= 2 && watched < tot`）、`pendingCount`（`tot > 0 ? Math.max(0, tot - watched) : 0`）、`airWeekdayLabel`（匹配周历放送日），在横幅标题行与切换胶囊上直观渲染，并支持点击胶囊直接切换当前聚光灯番剧。
3. **分集神回与单集手帐 (`renderEpisodeBlock` & `showEpisodeEditor`)**：
   - 未看或已看单集点击时，若已看或带有神回/批注/本地文件则直接展开 `showEpisodeEditor`；未看普通格子单击仍保持「一键标为已看」的高效直觉，同时在已展开的编辑器或右键/再次点击时随时可点亮 `★ 神回` 与填写 `单集一句话手帐吐槽`。
   - 分集网格下方实时渲染「✦ 本剧神回与分集手帐摘录」，点击任意摘录条目可定位并编辑该集批注。
