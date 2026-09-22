# 阿拉小红娘 · 婚恋红娘服务平台

> 线下婚恋服务机构的**用户前台网站 + 员工工作台 + 管理后台**概念原型。
> 不是泛社交网站，也不是算法自动配对 —— 核心是专业红娘的一对一服务。

当前阶段：**概念原型**。重点是把业务逻辑跑通、可演示、可扩展，
不在原型里实现高成本或尚未确认的外部能力。

---

## 仓库内容

```
├── 婚恋红娘服务平台需求设计说明书.md   ← 先读这个：产品范围、业务规则、角色权限、页面结构
├── design-contract.md                 视觉与交互契约
├── 缘境登录页/                        可运行的 Vue 前端原型（含 3D 同心锁交互）
│   ├── src/components/TongxinLock3D.vue
│   ├── public/assets/                 同心锁 3D 模型与贴图
│   └── README.md                      启动方式与登录接口约定
├── TongxinLock3D.vue                  同心锁 3D 组件（独立版）
├── 同心锁抬升高度修正操作指南.md        3D 模型的调整记录
├── prototype-intro/                   产品原型说明页（静态 HTML）
├── quotation-plan/                    报价方案页（静态 HTML）
├── smartcall-prototype-intro/         外呼系统原型说明页
├── smartcall-quotation-plan/          外呼系统报价方案页
└── tongxin-lock-prompt-spec/          同心锁 3D 提示词规格说明
```

`prototype-intro` / `quotation-plan` 等几个是**纯静态 HTML**，双击 `.html` 即可在浏览器打开，
不需要起服务。

## 跑登录页原型

```powershell
cd 缘境登录页
npm install
npm run dev
```

默认地址 `http://localhost:5175/#/login`。

登录走 `POST /api/v1/auth/login`，默认请求当前站点。认证服务不在同一地址时：

```powershell
$env:VITE_API_BASE_URL = 'http://localhost:8000/'
npm run dev
```

响应需包含 `code`、`message`、`data.token`、`data.user`
（`data.user` 至少含 `id`、`username`、`display_name`、`department`、`role`、`last_login_at`）。

---

## ⚠️ 关于 3D 模型

同心锁的 **Blender 源工程（11 个 `.blend`，单个 91~139MB）与迭代导出的 `.glb`**
**没有包含在本仓库里** —— 超过 GitHub 单文件 100MB 硬上限。

仓库里只保留了 demo 真正引用的那一个：
`缘境登录页/public/assets/concentric_lock_copper_gold.glb`

需要源文件留档的话，请走网盘或 GitHub Release。

---

<sub>本仓库为单次快照，不含 git 历史。压缩包（原型源码包、文档合集）未包含 —— 源码已在上面的目录里。</sub>
