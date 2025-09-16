# 概览

## 目标

在 blog-library 中增加 `createSite` 和 `createSiteKey` 两个脚本，并在 package.json 中增加相应命令，用于：

1. 创建新站点 (createSite)
2. 为指定站点创建 API 密钥 (createSiteKey)

## 技术栈

- **TypeScript** - 脚本开发语言
- **Commander.js** - CLI 框架，与现有脚本保持一致
- **Node.js** - 运行环境
- **tsx** - TypeScript 执行器
- **dotenv** - 环境变量管理
- **node-fetch** - HTTP 请求库
- **zod** - 数据验证

# 后端

## API 接口

### 创建站点接口

**URL**: `POST /sites`

**请求头**:

```
Authorization: Bearer {ADMIN_API_KEY}
Content-Type: application/json
```

**Body 参数**:

```typescript
{
  name: string;        // 站点名称，必填，只能包含字母和'-'
  description?: string; // 站点描述，可选
}
```

**Request Example**:

```json
{
  "name": "my-blog",
  "description": "My personal blog site"
}
```

**Response Example**:

```json
{
  "success": true,
  "data": {
    "id": "uuid-string",
    "name": "my-blog",
    "description": "My personal blog site",
    "created_at": "2024-01-01T00:00:00.000Z",
    "updated_at": "2024-01-01T00:00:00.000Z"
  }
}
```

### 创建站点 API 密钥接口

**URL**: `POST /sites/{name}/api-keys`

**路径参数**:

- `name`: 站点名称

**请求头**:

```
Authorization: Bearer {ADMIN_API_KEY}
Content-Type: application/json
```

**Body 参数**:

```typescript
{
  name: string;           // API 密钥名称，必填
  expiresAt?: string;     // 过期时间 (ISO 8601 格式)，可选
}
```

**Request Example**:

```json
{
  "name": "blog-upload-key",
  "expiresAt": "2024-12-31T23:59:59.000Z"
}
```

**Response Example**:

```json
{
  "success": true,
  "data": {
    "id": "uuid-string",
    "apiKey": "generated-api-key-string",
    "name": "blog-upload-key",
    "siteId": "site-uuid",
    "expiresAt": "2024-12-31T23:59:59.000Z",
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

## Error Handling

两个 API 都使用统一的错误处理格式：

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Error description"
  }
}
```

常见错误：

- `SITE_EXISTS`: 站点名称已存在
- `SITE_NOT_FOUND`: 站点不存在
- `UNAUTHORIZED`: 认证失败
- `VALIDATION_ERROR`: 请求参数验证失败（如站点名称格式不符合要求）

# Frontend

## Scripts

### createSite.ts

**文件位置**: `apps/blog-library/scripts/createSite.ts`

**功能**: 创建新站点

**使用方式**:

```bash
pnpm run createSite <site-name> [description]
```

**主要功能**:

1. 从命令行参数获取站点名称和描述
2. 从环境变量加载配置 (CMS_BASE_URL, ADMIN_API_KEY)
3. 调用后端 API 创建站点
4. 显示创建结果

**环境变量依赖**:

- `CMS_BASE_URL`: CMS API 基础 URL
- `ADMIN_API_KEY`: 管理员 API 密钥

### createSiteKey.ts

**文件位置**: `apps/blog-library/scripts/createSiteKey.ts`

**功能**: 为指定站点创建 API 密钥

**使用方式**:

```bash
pnpm run createSiteKey <site-name> <key-name> [expires-at]
```

**主要功能**:

1. 从命令行参数获取站点名称、密钥名称和过期时间
2. 从环境变量加载配置
3. 调用后端 API 创建 API 密钥
4. 显示创建的 API 密钥（仅显示一次）

**环境变量依赖**:

- `CMS_BASE_URL`: CMS API 基础 URL
- `ADMIN_API_KEY`: 管理员 API 密钥

## 代码结构

### APIClient 扩展

需要在现有的 `APIClient` 类中添加以下方法：

```typescript
// 创建站点
async createSite(siteData: CreateSiteRequest): Promise<CreateSiteResponse>

// 创建站点 API 密钥
async createSiteApiKey(siteName: string, keyData: CreateApiKeyRequest): Promise<CreateApiKeyResponse>
```

### 类型定义

需要添加以下类型定义（如果尚未存在）：

```typescript
// 创建站点请求
interface CreateSiteRequest {
  name: string; // 站点名称，只能包含字母和'-'
  description?: string;
}

// 创建站点响应
interface CreateSiteResponse {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
  updated_at: string;
}

// 创建 API 密钥请求
interface CreateApiKeyRequest {
  name: string;
  expiresAt?: string;
}

// 创建 API 密钥响应
interface CreateApiKeyResponse {
  id: string;
  apiKey: string;
  name: string;
  siteId: string;
  expiresAt: string | null;
  createdAt: string;
}
```

### package.json 修改

在 `apps/blog-library/package.json` 的 `scripts` 部分添加：

```json
{
  "scripts": {
    "createSite": "tsx scripts/createSite.ts",
    "createSiteKey": "tsx scripts/createSiteKey.ts"
  }
}
```

### 错误处理

两个脚本都将实现与现有脚本类似的错误处理：

1. **网络错误**: API 请求失败时的友好提示
2. **验证错误**: 参数格式不正确时的详细说明（如站点名称格式不符合要求）
3. **认证错误**: API 密钥无效或过期的处理
4. **业务错误**: 站点已存在、站点不存在等业务逻辑错误

### 日志输出

使用表情符号和颜色输出，与现有脚本保持风格一致：

- `🚀` 开始处理
- `⚙️` 配置加载
- `✅` 成功完成
- `❌` 错误发生
- `💡` 故障排除提示
