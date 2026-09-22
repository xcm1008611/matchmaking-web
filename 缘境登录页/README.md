# 阿拉小红娘 · 前端原型

这是"阿拉小红娘"婚恋平台的前端原型，包含苦情巨树背景、花丝花瓣粒子和登录表单。目录内没有 BP 单据的任务页、后台页或后端代码，可以直接整体移动到其他位置。

## 启动

```powershell
npm install
npm run dev
```

默认地址：`http://localhost:5175/#/login`

## 接口

登录请求使用 `POST /api/v1/auth/login`，默认请求当前站点。若认证服务不在同一地址，可在启动前设置：

```powershell
$env:VITE_API_BASE_URL = 'http://localhost:8000/'
npm run dev
```

登录响应需要返回包含 `code`、`message`、`data.token` 和 `data.user` 的结构，其中 `data.user` 至少包含 `id`、`username`、`display_name`、`department`、`role`、`last_login_at`。
