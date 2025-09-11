# 图片上传功能技术设计文档

## 概览

### 目标

在现有 CMS 系统中新增图片上传功能，支持将本地图片上传到 Cloudflare R2 对象存储，并自动替换 MDX 文件中的本地图片引用为 R2 URL，使博客内容在线上可用。

### 技术栈

- **后端**: Hono + Cloudflare Workers + Cloudflare R2
- **CLI 工具**: TypeScript + Commander.js + AWS SDK v3 (R2 兼容)
- **认证**: 环境变量存储的全局管理密钥
- **数据库**: Cloudflare D1 (无需新增表)

# 后端

## API 接口

### 图片上传接口

**URL**: `POST /image/upload`

**认证**: Bearer Token (从环境变量 `ADMIN_API_KEY` 读取)

**Content-Type**: `multipart/form-data`

**Body参数**

| 参数名   | 类型   | 必填 | 说明                                      |
| -------- | ------ | ---- | ----------------------------------------- |
| image    | File   | 是   | 图片文件，支持 jpg/jpeg/png/gif/webp 格式 |
| siteId   | string | 是   | 站点ID，用于生成存储路径                  |
| postSlug | string | 是   | 文章slug，用于生成存储路径                |

**自动路径生成规则**: `{siteId}/{postSlug}/{uuid}.{imageExtension}`

**Request Example**

```bash
curl -X POST "https://api.example.com/image/upload" \
  -H "Authorization: Bearer your-admin-api-key" \
  -F "image=@/path/to/local/image.jpg" \
  -F "siteId=site1" \
  -F "postSlug=my-first-post"
```

**Response Example**

成功响应 (200):

```json
{
  "success": true,
  "data": {
    "url": "https://r2-domain.com/site1/my-first-post/550e8400-e29b-41d4-a716-446655440000.jpg",
    "path": "site1/my-first-post/550e8400-e29b-41d4-a716-446655440000.jpg",
    "size": 102400,
    "contentType": "image/jpeg"
  },
  "message": "Image uploaded successfully"
}
```

错误响应 (400/401/413):

```json
{
  "success": false,
  "error": {
    "code": "INVALID_FILE_TYPE",
    "message": "Unsupported image format. Allowed: jpg, jpeg, png, gif, webp",
    "details": {}
  }
}
```

## Error Handling

### 图片上传接口错误码

- `INVALID_ADMIN_KEY`: 管理员 API 密钥无效或缺失
- `INVALID_FILE_TYPE`: 不支持的文件类型
- `FILE_TOO_LARGE`: 文件大小超过限制 (5MB)
- `UPLOAD_FAILED`: R2 上传失败
- `MISSING_FILE`: 请求中缺少图片文件

## 实现细节

### 管理员认证中间件

创建新的 `adminAuth()` 中间件：

```typescript
export function adminAuth(): MiddlewareHandler<{
  Bindings: CFBindings;
  Variables: MiddlewareVars;
}> {
  return async (c, next) => {
    const authHeader = c.req.header("Authorization");
    const adminKey = c.env.ADMIN_API_KEY;

    if (!authHeader || !adminKey) {
      throw new CustomHttpException(ErrorCode.INVALID_ADMIN_KEY);
    }

    const token = authHeader.replace("Bearer ", "");
    if (token !== adminKey) {
      throw new CustomHttpException(ErrorCode.INVALID_ADMIN_KEY);
    }

    await next();
  };
}
```

### R2 集成

使用 Cloudflare Workers 原生 R2 API：

```typescript
// 直接使用 Workers R2 绑定
const key = `${siteId}/${postSlug}/${crypto.randomUUID()}.${fileExtension}`;
await c.env.R2_BUCKET.put(key, imageFile, {
  httpMetadata: {
    contentType: file.type,
  },
});

// 构建公开访问 URL
const imageUrl = `https://${c.env.R2_PUBLIC_DOMAIN}/${key}`;
```

### 环境变量配置

需要在 Cloudflare Workers 中配置以下环境变量：

- `ADMIN_API_KEY`: 全局管理 API 密钥
- `R2_BUCKET`: R2 存储桶绑定 (在 wrangler.toml 中配置)
- `R2_PUBLIC_DOMAIN`: R2 公开访问域名

# CLI 工具

## 图片上传脚本 (imgUpload.ts)

### 功能实现

1. **解析 MDX 文件**: 使用正则表达式提取所有图片引用
2. **识别本地图片**: 过滤出以相对路径或 `./` 开头的本地图片
3. **批量上传**: 调用后端 API 上传本地图片到 R2
4. **路径替换**: 用 R2 URL 替换原始本地路径
5. **更新文件**: 保存修改后的 MDX 内容

### 命令格式

```bash
pnpm run imgUpload site1/zh-CN/first-blog.mdx
```

### 实现示例

```typescript
export class ImageUploader {
  private baseURL: string;
  private adminKey: string;

  async upload(filePath: string): Promise<void> {
    // 1. 解析文件路径和读取内容
    const pathInfo = this.parseFilePath(filePath);
    const content = await fs.readFile(pathInfo.fullPath, "utf-8");

    // 2. 解析 MDX frontmatter 获取 siteId 和 slug
    const parseResult = await this.mdxParser.parse(pathInfo.fullPath);
    const { siteId, slug } = this.extractMetadata(
      parseResult.metadata,
      pathInfo,
    );

    // 3. 提取本地图片引用
    const localImages = this.extractLocalImages(content);

    if (localImages.length === 0) {
      console.log("No local images found");
      return;
    }

    // 4. 上传图片并获取 R2 URLs
    const uploadResults = await this.uploadImages(localImages, siteId, slug);

    // 5. 替换图片路径
    let updatedContent = content;
    for (const result of uploadResults) {
      updatedContent = updatedContent.replace(result.localPath, result.r2Url);
    }

    // 6. 保存更新的文件
    await fs.writeFile(pathInfo.fullPath, updatedContent, "utf-8");

    console.log(`Updated ${uploadResults.length} images in ${filePath}`);
  }

  private extractLocalImages(content: string): string[] {
    // 匹配 Markdown 图片语法: ![alt](path)
    const imageRegex = /!\[.*?\]\(([^)]+)\)/g;
    const localImages: string[] = [];
    let match;

    while ((match = imageRegex.exec(content)) !== null) {
      const imagePath = match[1];
      // 只处理本地图片 (相对路径)
      if (!imagePath.startsWith("http") && !imagePath.startsWith("//")) {
        localImages.push(imagePath);
      }
    }

    return [...new Set(localImages)]; // 去重
  }

  private extractMetadata(
    metadata: any,
    pathInfo: PathInfo,
  ): { siteId: string; slug: string } {
    // 从文件路径提取 siteId，从 frontmatter 提取 slug
    const siteId = pathInfo.siteId;
    const slug = metadata.slug;

    if (!slug) {
      throw new Error("Missing slug in MDX frontmatter");
    }

    return { siteId, slug };
  }

  private async uploadImages(
    localImages: string[],
    siteId: string,
    slug: string,
  ): Promise<UploadResult[]> {
    const results: UploadResult[] = [];

    for (const imagePath of localImages) {
      try {
        // 上传单个图片到 API
        const formData = new FormData();
        const imageFile = await fs.readFile(path.resolve(imagePath));
        formData.append(
          "image",
          new Blob([imageFile]),
          path.basename(imagePath),
        );
        formData.append("siteId", siteId);
        formData.append("postSlug", slug);

        const response = await fetch(`${this.baseURL}/image/upload`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${this.adminKey}`,
          },
          body: formData,
        });

        if (!response.ok) {
          throw new Error(`Upload failed: ${response.statusText}`);
        }

        const result = await response.json();
        results.push({
          localPath: imagePath,
          r2Url: result.data.url,
        });

        console.log(`✅ Uploaded: ${imagePath} -> ${result.data.url}`);
      } catch (error) {
        console.error(`❌ Failed to upload ${imagePath}:`, error);
        throw error;
      }
    }

    return results;
  }
}
```

## 博客上传增强 (blogUpload.ts)

### 本地图片检验

在现有 `blogUpload.ts` 的 `upload()` 方法中添加检验：

```typescript
// 在解析 MDX 文件后，检查本地图片
const parseResult = await this.mdxParser.parse(pathInfo.fullPath);

// 检查是否存在本地图片引用
const hasLocalImages = this.checkLocalImages(parseResult.content);
if (hasLocalImages) {
  throw new Error(
    `Found local images in ${filePath}. Please run 'pnpm run imgUpload ${filePath}' first to upload images to R2.`,
  );
}
```

### 检验方法实现

```typescript
private checkLocalImages(content: string): boolean {
  const imageRegex = /!\[.*?\]\(([^)]+)\)/g;
  let match;

  while ((match = imageRegex.exec(content)) !== null) {
    const imagePath = match[1];
    // 检查是否为本地图片路径
    if (!imagePath.startsWith('http') && !imagePath.startsWith('//')) {
      return true;
    }
  }

  return false;
}
```

## 配置要求

### 环境变量

需要在 `blog-library/.env` 中配置：

```bash
# CMS API 配置
CMS_BASE_URL=https://your-api.com
ADMIN_API_KEY=your-admin-api-key

# 站点 API 密钥 (现有配置)
SITE1_API_KEY=site1-api-key
```

### package.json 脚本

现有配置已包含所需脚本：

- `imgUpload`: 图片上传脚本
- `blogUpload`: 博客上传脚本

## 使用流程

1. **编写博客内容**: 在 MDX 文件中使用本地图片路径
2. **上传图片**: `pnpm run imgUpload site1/zh-CN/first-blog.mdx`
3. **上传博客**: `pnpm run blogUpload site1/zh-CN/first-blog.mdx`

如果步骤2未执行，步骤3将失败并提示先上传图片。
