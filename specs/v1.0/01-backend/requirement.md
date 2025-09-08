# MVP 后端需求

## 目标

开发一个简单的 Headless CMS，用来管理多个网站的博客内容。每一个网站服务器可以通过接口请求 CMS 中该网站的博客内容。
该 CMS 属于个人自用，不需要 UI 界面，文章可以通过脚本请求服务接口创建。

## 功能点

1. 提供文章列表查询接口, 支持分页查询
2. 提供文章详情查询接口
3. 每个网站有单独 API KEY 控制权限
4. 支持多语言博客
5. 支持在本地写 MDX 文件， 在 front matter 中写元数据。本地通过脚本解析 MDX 内容和元数据，调用接口上传。

## 流程

### 创建博客

1. 用户在本地 `app/content` 目录下的 `site1/zh` 目录下创建 `first-blog.mdx` 文件
2. 在 `first-blog.mdx` 的 front matter 区域写下元数据，包括：作者、日期、Status(draft/published)、摘要、语言、slug、Cover
3. 运行 `pnpm run imgUpload site1/zh/first-blog.mdx`，将 Cover 和博客内容中的本地图片上传到 Cloudflare R2，并替换地址
4. 运行 `pnpm run blogUpload first-blog.mdx`
   1. 解析：从 mdx 提取元数据和正文
   2. 验证：必选字段是否填写；mdx 格式能否在本地正确渲染；
   3. 上传：调用博客创建接口创建博客

### 网站请求博客

1. 网站调用博客列表接口，返回分页博客列表，每篇博客只返回元数据
2. 用户点击某一篇博客之后，请求博客详情接口，返回这篇博客正文
