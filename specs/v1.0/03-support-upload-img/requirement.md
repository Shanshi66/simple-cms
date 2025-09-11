# 增加图片上传功能

## 目标

在该 CMS 中，博客内容是在本地写的，图片也会存在本地。为了让博客内容线上可用，需要将图片上传到 Cloudflare R2，然后使用 Cloudflare R2 的图片地址替换本地地址。

## 功能点

- 在 service 中增加图片上传接口，返回图片地址。增加一个全局管理 API KEY，在请求管理 API 时通过该 KEY 鉴权。不用存到数据库， 从环境变量中读取。
- 在 `blog-library`目录下运行 `pnpm run imgUpload site1/zh-CN/first-blog.mdx`，将博客内容中的本地图片上传到 Cloudflare R2，使用 Cloudflare R2 地址替换本地图片地址。
- 在 `blog-library`目录下运行 `pnpm run blogUpload site1/zh-CN/first-blog.mdx`之前增加是否存在本地图片检验，如果有，则检验失败
