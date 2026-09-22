# Design Contract · 缘境婚恋红娘服务平台高保真交互原型系统

## 1. 技术栈与交付形式
- **Tech Stack**: Vue 3 + Vite + TypeScript + Pinia + Vue Router + Element Plus
- **Delivery Type**: Build-type / Standard SPA Project（具备全生命周期模拟状态引擎，可离线直接在本地极速启动体验）
- **Core Strategy**: 
  - 前台（C端）：东方温润浪漫雅致风，注重情感信任、轻奢典雅与温馨动效
  - 工作台（B端）：高效卡片工作流，聚焦会话分流、匹配算力、约见日历与个案追踪
  - 后台（M端）：经营指标漏斗、全域线索管控、门店组织与内容风控

## 2. 视觉 Token 体系
- **主色调（Primary）**:
  - `color.primary`: `#C94B62` (胭脂绯红 - 典雅中正的东方浪漫)
  - `color.primary-hover`: `#D96076`
  - `color.primary-active`: `#A8364B`
  - `color.primary-light`: `#FDF2F4`
  - `color.primary-subtle`: `#FAF0F2`
- **辅助色（Secondary & Accents）**:
  - `color.accent-gold`: `#C29353` (缃叶暖金 - 品质感与信任度)
  - `color.accent-gold-light`: `#FDF8EF`
  - `color.accent-teal`: `#3B7E8C` (青黛 - 沉稳与专业，用于顾问与数据分析)
  - `color.accent-teal-light`: `#EFF7F9`
- **中性色与背景（Neutrals & Surfaces）**:
  - `color.bg-base`: `#FBF9F7` (玉脂暖白 - 避免死白刺眼)
  - `color.bg-surface`: `#FFFFFF`
  - `color.bg-card-subtle`: `#F8F5F1`
  - `color.text-main`: `#27222B` (墨砚浓黑)
  - `color.text-regular`: `#58515E`
  - `color.text-secondary`: `#8E8694`
  - `color.text-placeholder`: `#BFB9C4`
  - `color.border-base`: `#EBE5DF`
  - `color.border-light`: `#F2EDE8`
- **状态色（Functional）**:
  - `color.success`: `#3E9B72` (松柏青)
  - `color.warning`: `#D97706` (琥珀橙)
  - `color.danger`: `#DC2626` (朱砂赤)
  - `color.info`: `#64748B` (石板灰)
- **字体规范（Typography）**:
  - Display Font: `'PingFang SC', 'STKaiti', 'Kaiti', 'Source Han Serif SC', serif` (标题微带人文书卷气息)
  - Body Font: `-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'PingFang SC', 'Microsoft YaHei', sans-serif`
  - Scale: 12 / 13 / 14 / 16 / 18 / 22 / 28 / 36 (px)
- **圆角与阴影（Radius & Shadows）**:
  - `radius.sm`: 6px | `radius.md`: 10px | `radius.lg`: 16px | `radius.full`: 9999px
  - `shadow.card`: `0 4px 20px -2px rgba(90, 50, 60, 0.05), 0 2px 6px -1px rgba(0, 0, 0, 0.02)`
  - `shadow.floating`: `0 12px 32px -4px rgba(90, 50, 60, 0.12), 0 4px 12px rgba(0,0,0,0.04)`

## 3. 三端协同与全流程状态模型 (Status & State Machine)
- **用户前台（C端）**:
  - `/` (首页): 品牌定位、精选脱敏会员、红娘顾问天团、幸福案例、在线预约
  - `/services/match`: 婚恋介绍专区（定制相亲体系、服务流程、方案定价）
  - `/services/consult`: 情感调解专区（矛盾诊断、夫妻沟通、个案申请）
  - `/members`: 脱敏优质会员大厅（多维筛选、会员详情卡、请红娘牵线）
  - `/matchmakers`: 资深红娘顾问团队展示（资质年限、擅长领域、专属预约）
  - `/cases`: 幸福牵线与情感改善案例库
  - `/user/center`: 用户个人中心（渐进式婚恋档案五步法、服务申请时间线、约见日程）
  - 全局组件: 在线咨询浮窗（多维需求快速分流）、顶部全局端切换栏
- **员工工作台（B端）**:
  - `/workbench/reception`: 客服接待台（三栏式实时会话、意向标记、一键建线索/转派红娘顾问）
  - `/workbench/matchmaker`: 红娘专属工作台（客户档案看板、智能双向人选匹配、约见日程排期、回访反馈）
  - `/workbench/counselor`: 情感顾问工作台（个案追踪、调解排期、过程记录与风险提示）
- **管理后台（M端）**:
  - `/admin/dashboard`: 经营大盘（访问→线索→到店→签约→牵线漏斗分析、门店员工业绩PK）
  - `/admin/leads`: 线索公海与全生命周期客户库（状态跃迁、批量分派、操作留痕）
  - `/admin/stores-staff`: 多门店与员工组织架构管理
  - `/admin/content`: 网站运营内容与脱敏审核中心

## 4. 全局演示身份（Quick Role Switcher）
提供顶部吸顶悬浮演示切换条：
1. **普通访客** (Visitor - 浏览公开信息与申请)
2. **注册会员** (林书雅 · 28岁金融分析师 · 待完善资料与跟进中)
3. **金牌红娘** (苏婉宁 · 从业8年 · 管理24位客户与约见安排)
4. **资深情感顾问** (沈清墨 · 心理学硕士 · 管理6起婚姻调解个案)
5. **客服主管** (李晓萌 · 负责在线会话接待与分流)
6. **平台超级管理员** (张总 / Admin · 全局经营漏斗与管理配置)
