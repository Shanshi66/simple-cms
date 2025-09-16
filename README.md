# Simple CMS

一个简单的 CMS，可以管理托管多个网站的博客内容，通过接口访问。本项目 95% 的代码是 Claude Code 写的。

## 概览

本项目采用 monorepo 结构，使用 pnpm workspace 进行管理。之所以采用 monorepo 结构，是为了让 AI 更好地了解项目整体情况。比如在开发前端的时候可以知道后端接口是什么样的，可以共享接口数据结构。

项目后端采用 `hono`，前端是简单的 `CLI`，没有 UI 界面。博客内容采用 `mdx` 进行编写。

## 开始使用

### 服务部署

本项目需部署在 Cloudflare 上，数据库使用 D1，对象存储使用 R2. 具体步骤如下：

1. 创建 D1 和 R2, 将相关配置放到 `apps/service/wrangler.jsonc` 中
2. 将项目上传 Github，在 Cloudflare 中关联 github 项目进行部署。部署命令 `cd apps/service && pnpm run deploy`
3. 服务需要配置两个环境变量, 参见 `@apps/service/.dev.vars.example`。分别是:
   1. `ADMIN_API_KEY`: 用来对博客创建、网站创建进行鉴权，用 `secret` 存储
   2. `R2_PUBLIC_DOMAIN`: R2 的自定义域名，用来存放与访问图片

### 写博客

可直接在本地用 mdx 写博客，在本地完成验证并上传，具体步骤如下：

1. 将 `sample-content` 目录重命名为 `content`，`content`目录下每个子目录是一个网站，每个网站下的子目录是多语言
2. 在

## 开发

做这个项目的起因是我想在 Cloudflare Worker 上用 React Router 部署一个 SSR 网站，因为 Cloudflare Worker 是 Edge环境，不支持 fs，导致很多文档系统都不支持。在调研了许多 cms 系统之后发现都有点复杂，因此有了自己开发一个简化版的想法。

这个项目 95% 以上代码都是由 Claude Code 来完成的，一开始趟了一些坑，重写了一遍。后来学习了 spec-driven development 方法论之后，才有了点驾驭 AI 的感觉。整个开发过程参见 `specs` 目录。

### Specs 开发流程

`specs`目录每个顶层目录是一个版本，每个版本由多个 `spec` 开发完成，每个 `spec` 目录下有三个文件，借鉴自 [Kiro](https://kiro.dev/docs/specs/)

- `requirement.md`: 需求文档，主要由人写，描述清楚需求和业务流程
- `design.md`: 设计文档，AI 根据需求文档生成技术方案，需要人工审核
- `task.md`: 由 AI 根据技术文档生成任务列表

为了这个模式，设计了几个 slash command，详见 `.claude/commands`, 具体是：

1. `req-analyze`: 分析需求
2. `design`: 设计技术方案
3. `task-split`: 拆分任务
4. `task-exec`: 执行任务

流程：

1. 新建一个 spec 文件夹，每个 spec 尽可能小
2. 新建 `requirement.md` 文件，描述需求，尽可能具体
3. 运行 `/req-analyze requirement.md` 分析需求，这个过程可能会给出很专业复杂的结果，挑选遗漏的补充到需求文档即可，不需要太复杂
4. 运行 `/design requirement.md` 会在需求文档所在目录生成 `design.md`，需要人仔细审核修改
5. 运行 `/task-split design.md` 会先生成父任务，同意后再生成完整 `task.md`
6. `task.md` 中会有多个任务，运行 `/task-exec task.md 任务编号`开始执行任务
