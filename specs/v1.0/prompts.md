我想做一个自己用的 CMS 系统, 用来存放我做的多个网站的博客内容, 提供接口供这些网站进行内容查询.
每个网站查询接口时需要设置一个 api key. 提供一个简单页面用来写文章, 使用 Google 登录, 写的文章用 mdx 格式存储.
请帮我写一个 PRD 并存放到 @docs/v1.0.0/prd.md 中, 不需要参考现有代码. think hard.

@docs/v1.0.0/prd.md 不要太复杂, 只需要文档基本信息, 项目背景与目标, 功能具体描述. 这是一个 mvp 版本, 尽可能简单. 用中文写.

@docs/v1.0.0/prd.md 在第一个版本不提供 UI, 可以在本地编辑内容, 通过本地脚本调用服务接口创建文章, 请修改 PRD

use pdf-crafter, 请优化以下这个 PRD @agent-prd-drafter

use prd crafter, 请删掉 @agent-prd-drafter 中的技术细节, 只保留项目背景与功能描述

@agent-prd-drafter 请简化 PRD 文档, 这是一个个人自用项目, 我不需要在意 UI, 不需要在意 API 的轮动, 只做最简单的MVP 功能, 包括: 1) 各个网站从 API 中获取文章列表和文章详情, 2) 支持在本地通过脚本创建文章; 不需要标签管理, 也不需要作者信息, 不需要搜索等等, 尽可能简单. 本地使用可以在 @apps/web/app/ 中创建一个 content 项目, 里面每个文件夹可以是一个网站的内容. think hard.

---

@docs/v1.0.0/prd.md 根据该 prd 文档, 及当前 monorepo 代码库结构及技术栈, 设计详细的架构方案. 包括数据表设计, API
接口设计, 目录结构等, 越详细越好. 将最终的架构方案写到 @docs/architecture.md 中, 用中文书写. 请严格按照 PRD 文档设计，不要引入不必要的复杂度， 尽可能简单 pleaseåthink hard.

@docs/architecture.md 将文章 content 与元数据 存在一张表是不是不合理, 因为在网站博客列表页面,
只需要获取元数据就可以, 只有进到文章详情页才需要获取完整内容. 另外, 需要增加文章摘要内容字段

仔细审视这个接口, 如果以后我要做一个网站控制台, 考虑这种情况: 我需要显示所有文章, 包括草稿和所有语言

将published 改成 status 是不是好点, 有两个值: published 和 draft, 当请求接口的时候,如果不传默认请求全部, 默认是
published

为什么 3.2.2 与 3.2.1 接口方案中对 param 处理方式不一样, 一个是放到 query 参数里,一个放到路径里, 哪种方式更好

GET /api/articles?site={site}&lang={language}&status={status}&page={page}&limit={limit}
GET /api/articles/{site}/{language}/{slug}

不是上传文件, 是在本地将 mdx 文件进行解析, 将 frontmatter 中的数据提取为元数据, 将正文提取为 content

@specs/mvp/plan.md 基于我的目标,分析一下我列举的功能和流程有没有什么不妥的地方. 不用参考其他文件. think hard
