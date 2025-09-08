# MVP 前端需求

## 目标

开发一个简单的 Headless CMS，用来管理多个网站的博客内容。目前后端服务已经开发好了，需要开发一个前端用于上传文章。
该 CMS 属于个人自用，不需要 UI 界面，文章可以通过脚本请求服务接口创建。

## 功能点

- 在本地管理各个网站的博客内容
- 博客内容用 mdx 格式存储，在 front matter 中写元数据，具体字段请参阅目前的数据库表结构
- 博客支持多语言
- 当用本地路径在博客中写图片时，当运行图片上传脚本时，支持将图片上传至 Cloudflare R2，并用Cloudflare R2的路径替代本地路径
- 校验 mdx 格式是否正确

## 目录结构

- `apps/blog-library` 是前端所在路径
- `apps/blog-library/content` 是所有博客内容所在路径，每个网站单独一个文件夹
- `apps/blog-library/script` 运行脚本所在地，通过在 `package.json` 中配置
- `apps/blog-library/src` 代码路径
- `apps/blog-library/.env` 存放每个网站的 api key 和服务器 base url

## 流程

1. 用户在本地 `apps/blog-library/content` 目录下的 `site1/zh-CN` 目录下创建 `first-blog.mdx` 文件
2. 在`first-blog.mdx` 的 front matter 区域写下元数据
3. 在 `blog-library`目录下运行 `pnpm run imgUpload site1/zh-CN/first-blog.mdx`，将博客内容中的本地图片上传到 Cloudflare R2，并替换地址
4. 在 `blog-library`目录下运行 `pnpm run blogUpload site1/zh-CN/first-blog.mdx`，会执行以下操作
   1. 解析：从 mdx 提取元数据和正文
   2. 验证：必选字段是否填写；mdx 格式能否在本地正确渲染；
   3. 上传：调用博客创建接口创建博客
