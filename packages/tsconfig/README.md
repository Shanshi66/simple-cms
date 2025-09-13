# TypeScript 配置包

这是一个共享的 TypeScript 配置包，为整个 monorepo 项目提供统一的 TypeScript 编译选项和类型检查规则。包含基础配置、React 配置和 Cloudflare 专用配置，确保所有项目具备一致的类型安全保障。

## 📋 配置包概述

### 主要特色

- 🎯 **类型安全**：严格的 TypeScript 配置，提供最佳的类型检查体验
- ⚛️ **React 优化**：专门为 React 项目优化的编译选项
- ☁️ **Cloudflare 支持**：针对 Cloudflare Workers 环境的专用配置
- 🚀 **现代化标准**：基于 ES2022 和最新的 TypeScript 特性
- 🔧 **可扩展**：支持项目特定的自定义配置
- 📦 **模块化设计**：不同环境使用不同的配置文件

### 设计理念

- **严格优先**：启用所有严格模式检查，确保代码质量
- **环境适配**：为不同运行环境提供最优配置
- **开发体验**：平衡严格性和开发效率
- **向前兼容**：支持最新的 TypeScript 特性
- **一致性**：确保整个 monorepo 的类型规范统一

## 📁 项目结构详解

```
packages/tsconfig/
├── base.json                  # 基础 TypeScript 配置
├── react.json                 # React 项目专用配置
├── cloudflare.json           # Cloudflare Workers 配置
├── package.json              # 包配置和导出
└── README.md                 # 使用文档
```

## 🚀 使用指南

### package.json 配置说明

#### 导出配置

```json
{
  "exports": {
    "./base.json": "./base.json", // 基础配置
    "./react.json": "./react.json", // React 配置
    "./cloudflare.json": "./cloudflare.json" // Cloudflare 配置
  }
}
```

这个导出配置允许其他项目通过以下方式引用：

- `@repo/tsconfig/base.json` - 基础配置（适用于所有 TypeScript 项目）
- `@repo/tsconfig/react.json` - React 配置（适用于 React 应用和组件库）
- `@repo/tsconfig/cloudflare.json` - Cloudflare 配置（适用于 Workers 项目）

### 在项目中使用配置

#### 1. 基础项目配置

适用于纯 TypeScript 项目，如工具包、配置包等：

```json
// tsconfig.json
{
  "extends": "@repo/tsconfig/base.json",
  "compilerOptions": {
    "outDir": "./dist",
    "rootDir": "./src"
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

**使用场景**：

- `packages/utils` - 工具函数包
- `packages/types` - 类型定义包
- `packages/eslint` - 配置包
- Node.js CLI 工具

#### 2. React 项目配置

适用于使用 React 的前端项目：

```json
// tsconfig.json
{
  "extends": "@repo/tsconfig/react.json",
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "~/*": ["./app/*"]
    }
  },
  "include": ["app/**/*", "remix.env.d.ts", "vite-env.d.ts"],
  "exclude": ["build", "public/build"]
}
```

**使用场景**：

- `apps/web` - React 前端应用
- `packages/ui` - React 组件库

#### 3. Cloudflare Workers 项目配置

适用于部署到 Cloudflare Workers 的项目：

```json
// tsconfig.json
{
  "extends": "@repo/tsconfig/cloudflare.json",
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["src/**/*", "worker-configuration.d.ts"],
  "exclude": ["node_modules", "dist", ".wrangler"]
}
```

**使用场景**：

- `apps/service` - Hono API 服务
- Cloudflare Pages Functions
- Edge Computing 项目

## 🔧 配置详解

### 基础配置 (base.json)

基础配置提供了所有 TypeScript 项目通用的编译选项：

#### 1. 核心配置选项

```json
{
  "$schema": "https://json.schemastore.org/tsconfig",
  "compilerOptions": {
    // 声明文件生成
    "declaration": true, // 生成 .d.ts 声明文件
    "declarationMap": true, // 生成声明文件的 source map

    // 模块系统
    "esModuleInterop": true, // 启用 ES 模块互操作
    "module": "NodeNext", // 使用 Node.js 的模块解析
    "moduleDetection": "force", // 强制模块检测
    "moduleResolution": "NodeNext", // Node.js 模块解析策略

    // 编译选项
    "incremental": false, // 禁用增量编译（避免 monorepo 问题）
    "isolatedModules": true, // 确保每个文件都可以独立编译
    "noEmit": true, // 不生成输出文件（只做类型检查）

    // 库支持
    "lib": ["es2022", "DOM", "DOM.Iterable"],

    // 严格模式
    "strict": true, // 启用所有严格模式检查
    "strictNullChecks": true, // 严格的 null 检查
    "noUncheckedIndexedAccess": true, // 严格的数组/对象访问检查

    // 其他选项
    "resolveJsonModule": true, // 支持导入 JSON 文件
    "skipLibCheck": true, // 跳过 .d.ts 文件的类型检查（提升性能）
    "target": "ES2022" // 编译目标为 ES2022
  }
}
```

#### 2. 关键特性解释

**严格模式配置**：

- `strict: true` 启用所有严格检查
- `strictNullChecks: true` 防止 null/undefined 错误
- `noUncheckedIndexedAccess: true` 防止数组越界访问

**模块化支持**：

- `module: "NodeNext"` 现代 Node.js 模块支持
- `moduleResolution: "NodeNext"` 最新的模块解析策略
- `esModuleInterop: true` 更好的 CommonJS 互操作

**开发体验**：

- `isolatedModules: true` 确保与构建工具兼容
- `skipLibCheck: true` 提升编译性能
- `resolveJsonModule: true` 支持 JSON 导入

#### 3. 使用示例

```typescript
// ✅ 正确的代码 - 严格模式下的最佳实践
interface User {
  id: string;
  name: string;
  email?: string;
}

function getUser(id: string): User | null {
  // 明确的返回类型
  return users.find((user) => user.id === id) ?? null;
}

function processUser(user: User) {
  // 严格的 null 检查
  if (user.email) {
    console.log(user.email.toLowerCase());
  }
}

// ❌ 会被 TypeScript 警告的代码
function badFunction(data: any[]) {
  // ❌ noUncheckedIndexedAccess 会警告
  return data[0].name;
}

function anotherBadFunction(user: User) {
  // ❌ strictNullChecks 会警告
  return user.email.toLowerCase();
}
```

### React 配置 (react.json)

React 配置在基础配置基础上添加了 React 特定的编译选项：

#### 1. 配置组成

```json
{
  "extends": "./base.json",
  "compilerOptions": {
    "module": "ESNext", // 使用现代 ES 模块
    "moduleResolution": "Bundler", // 打包工具模块解析
    "lib": ["ES2022", "DOM", "DOM.Iterable"], // 浏览器环境库
    "allowJs": true, // 允许 JavaScript 文件
    "jsx": "react-jsx", // 新的 JSX 转换
    "allowSyntheticDefaultImports": true // 允许合成默认导入
  }
}
```

#### 2. React 特定配置解释

**JSX 支持**：

- `jsx: "react-jsx"` 使用新的 JSX 转换（React 17+）
- 无需手动导入 React
- 更小的打包体积

**模块解析优化**：

- `moduleResolution: "Bundler"` 为现代打包工具优化
- `allowSyntheticDefaultImports: true` 更好的默认导入支持

**浏览器环境**：

- `lib` 包含 DOM 类型
- `allowJs: true` 支持 JavaScript 和 TypeScript 混合开发

#### 3. 使用示例

```tsx
// ✅ 新的 JSX 转换 - 无需导入 React
import { useState } from "react";

interface Props {
  title: string;
  count?: number;
}

export function Counter({ title, count = 0 }: Props) {
  const [value, setValue] = useState(count);

  // 严格的类型检查
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    setValue((prev) => prev + 1);
  };

  return (
    <div>
      <h2>{title}</h2>
      <p>Count: {value}</p>
      <button onClick={handleClick}>Increment</button>
    </div>
  );
}

// ✅ 支持 JavaScript 文件导入
import { utils } from "./utils.js";

// ✅ 合成默认导入支持
import axios from "axios"; // 即使 axios 没有默认导出也能正常工作
```

### Cloudflare 配置 (cloudflare.json)

Cloudflare 配置专门为 Cloudflare Workers 环境优化：

#### 1. 配置组成

```json
{
  "extends": "./base.json",
  "compilerOptions": {
    "target": "ES2022", // ES2022 目标（Workers 支持）
    "module": "ESNext", // ES 模块
    "moduleResolution": "Bundler", // 打包工具解析
    "lib": ["ES2022", "WebWorker"], // Web Worker 环境
    "types": ["@cloudflare/workers-types"], // Cloudflare 类型定义
    "declaration": false, // 不生成声明文件
    "declarationMap": false, // 不生成声明 map
    "allowSyntheticDefaultImports": true, // 合成默认导入
    "jsx": "react-jsx", // JSX 支持（如使用 Hono JSX）
    "jsxImportSource": "hono/jsx" // Hono JSX 运行时
  },
  "include": [],
  "exclude": []
}
```

#### 2. Cloudflare 特定配置解释

**Workers 环境**：

- `lib: ["ES2022", "WebWorker"]` Web Worker 环境类型
- `types: ["@cloudflare/workers-types"]` Cloudflare 绑定类型

**编译优化**：

- `declaration: false` Workers 不需要声明文件
- `target: "ES2022"` Workers 支持的最新标准

**JSX 支持**：

- `jsx: "react-jsx"` 支持 JSX 语法
- `jsxImportSource: "hono/jsx"` 使用 Hono 的 JSX 运行时

#### 3. 使用示例

```typescript
// ✅ Cloudflare Workers 环境代码
export interface Env {
  DB: D1Database;
  CACHE: KVNamespace;
  BUCKET: R2Bucket;

  // 环境变量
  API_SECRET: string;
  BASE_URL: string;
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext) {
    // Cloudflare Workers 全局对象可用
    const url = new URL(request.url);

    // D1 数据库操作
    const result = await env.DB.prepare(
      'SELECT * FROM users WHERE id = ?'
    ).bind(url.searchParams.get('id')).first();

    // KV 存储操作
    await env.CACHE.put('user:' + result.id, JSON.stringify(result));

    return new Response(JSON.stringify(result), {
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

// ✅ Hono JSX 支持
import { Hono } from 'hono';

const app = new Hono<{ Bindings: Env }>();

app.get('/', (c) => {
  return c.html(
    <html>
      <body>
        <h1>Hello from Cloudflare Workers!</h1>
      </body>
    </html>
  );
});
```

## 🛠 开发和维护

### 自定义项目配置

#### 1. 扩展基础配置

```json
// 自定义 tsconfig.json
{
  "extends": "@repo/tsconfig/base.json",
  "compilerOptions": {
    // 覆盖或添加选项
    "outDir": "./build",
    "rootDir": "./src",
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"],
      "@/components/*": ["./src/components/*"]
    },

    // 项目特定的严格检查
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "noUncheckedIndexedAccess": true
  },

  // 项目特定的包含/排除
  "include": ["src/**/*", "types/**/*", "*.d.ts"],
  "exclude": ["node_modules", "build", "dist", "**/*.test.ts"]
}
```

#### 2. 多环境配置

```json
// tsconfig.json (主配置)
{
  "extends": "@repo/tsconfig/react.json",
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "~/*": ["./app/*"]
    }
  },
  "include": ["app", "remix.env.d.ts"]
}

// tsconfig.node.json (Node.js 工具配置)
{
  "extends": "@repo/tsconfig/base.json",
  "compilerOptions": {
    "module": "CommonJS",
    "target": "ES2020"
  },
  "include": ["scripts", "tools"]
}
```

#### 3. 构建专用配置

```json
// tsconfig.build.json
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "noEmit": false, // 生成输出文件
    "declaration": true, // 生成类型声明
    "sourceMap": true, // 生成 source map
    "outDir": "./dist" // 输出目录
  },
  "exclude": ["**/*.test.ts", "**/*.spec.ts", "stories/**/*"]
}
```

### 版本管理和更新

#### 1. 更新 TypeScript 版本

```bash
# 检查当前 TypeScript 版本
npx tsc --version

# 更新到最新版本
cd packages/tsconfig
pnpm add -D typescript@latest

# 更新相关类型包
pnpm add -D @types/node@latest
```

#### 2. 测试配置更改

```bash
# 在各个项目中测试类型检查
cd apps/web
pnpm check-types

cd ../service
pnpm check-types

cd ../../packages/ui
pnpm check-types
```

#### 3. 配置升级步骤

```bash
# 1. 更新配置文件
vim packages/tsconfig/base.json

# 2. 测试所有项目
pnpm check-types

# 3. 修复类型错误
# 根据错误信息调整各项目的 tsconfig.json

# 4. 提交更改
git add packages/tsconfig/
git commit -m "feat(tsconfig): update to TypeScript 5.x"
```

## 🔍 配置优化指南

### 性能优化

#### 1. 编译性能优化

```json
{
  "compilerOptions": {
    // 跳过库文件检查（重要的性能优化）
    "skipLibCheck": true,

    // 禁用增量编译（monorepo 中可能有问题）
    "incremental": false,

    // 只进行类型检查，不生成文件
    "noEmit": true,

    // 强制模块检测（避免混合模式）
    "moduleDetection": "force"
  },

  // 优化包含/排除路径
  "include": [
    "src/**/*" // 只包含源代码目录
  ],
  "exclude": [
    "node_modules",
    "dist",
    "build",
    "**/*.test.ts", // 排除测试文件
    "**/*.stories.ts" // 排除 Storybook 文件
  ]
}
```

#### 2. 开发体验优化

```json
{
  "compilerOptions": {
    // 更好的错误信息
    "pretty": true,
    "listEmittedFiles": false,
    "listFiles": false,

    // 启用所有严格检查
    "strict": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "noUncheckedIndexedAccess": true,

    // 更严格的函数检查
    "exactOptionalPropertyTypes": true,
    "noImplicitOverride": true,
    "useUnknownInCatchVariables": true
  }
}
```

### 路径映射配置

#### 1. 项目内路径别名

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      // 源代码别名
      "@/*": ["./src/*"],
      "@/components/*": ["./src/components/*"],
      "@/utils/*": ["./src/utils/*"],
      "@/types/*": ["./src/types/*"],

      // 资源文件别名
      "@/assets/*": ["./public/assets/*"],

      // 配置文件别名
      "@/config/*": ["./config/*"]
    }
  }
}
```

#### 2. Monorepo 包引用

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@repo/types": ["../../packages/types/src/index"]
    }
  }
}
```

### 严格模式配置

#### 1. 最严格配置

```json
{
  "compilerOptions": {
    // 基础严格模式
    "strict": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "strictBindCallApply": true,
    "strictPropertyInitialization": true,
    "noImplicitAny": true,
    "noImplicitThis": true,
    "alwaysStrict": true,

    // 额外的严格检查
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "noUncheckedIndexedAccess": true,
    "exactOptionalPropertyTypes": true,
    "noImplicitOverride": true,
    "useUnknownInCatchVariables": true,

    // 未使用代码检查
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "allowUnreachableCode": false,
    "allowUnusedLabels": false
  }
}
```

#### 2. 渐进式严格配置

```json
{
  "compilerOptions": {
    // 基本严格模式
    "strict": true,

    // 逐步启用的检查
    "noImplicitReturns": false, // 先关闭，逐步修复
    "noFallthroughCasesInSwitch": false,
    "noUncheckedIndexedAccess": false, // 影响较大，后期启用

    // 开发友好的设置
    "noUnusedLocals": false, // 开发时关闭
    "noUnusedParameters": false
  }
}
```

## 🐛 常见问题和解决方案

### 1. 模块解析问题

**问题**：`Cannot find module` 或路径别名不工作

**解决方案**：

```json
// 确保正确配置 baseUrl 和 paths
{
  "compilerOptions": {
    "baseUrl": ".", // 重要：设置基础路径
    "moduleResolution": "NodeNext", // 或 "Bundler"
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

同时确保构建工具（Vite、Webpack 等）也配置了相同的别名：

```typescript
// vite.config.ts
export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
```

### 2. JSX 配置问题

**问题**：JSX 语法错误或 React 导入问题

**解决方案**：

```json
{
  "compilerOptions": {
    "jsx": "react-jsx", // 使用新的 JSX 转换
    "lib": ["DOM", "DOM.Iterable"], // 包含 DOM 类型

    // 如果使用其他 JSX 运行时
    "jsxImportSource": "preact" // 或其他运行时
  }
}
```

### 3. Cloudflare Workers 类型问题

**问题**：Cloudflare 全局对象未定义

**解决方案**：

```json
{
  "compilerOptions": {
    "lib": ["ES2022", "WebWorker"], // 不要包含 "DOM"
    "types": ["@cloudflare/workers-types"]
  }
}
```

同时确保安装了类型包：

```bash
pnpm add -D @cloudflare/workers-types
```

### 4. Monorepo 路径引用问题

**问题**：无法正确解析其他包的类型

**解决方案**：

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@repo/*": ["../../packages/*/src"]
    }
  }
}
```

或者使用 TypeScript 的项目引用：

```json
{
  "references": [
    { "path": "../../packages/ui" },
    { "path": "../../packages/utils" }
  ]
}
```

### 5. 性能问题

**问题**：TypeScript 编译很慢

**解决方案**：

```json
{
  "compilerOptions": {
    "skipLibCheck": true, // 最重要的性能优化
    "incremental": false, // monorepo 中禁用
    "noEmit": true // 只做类型检查
  },
  "exclude": [
    "node_modules",
    "dist",
    "**/*.test.ts", // 排除测试文件
    "**/*.stories.ts" // 排除不必要的文件
  ]
}
```

## 📚 学习资源

### 官方文档

- [TypeScript 官方手册](https://www.typescriptlang.org/docs/)
- [TSConfig 参考](https://www.typescriptlang.org/tsconfig)
- [TypeScript 编译选项](https://www.typescriptlang.org/docs/handbook/compiler-options.html)
- [模块解析策略](https://www.typescriptlang.org/docs/handbook/module-resolution.html)

### 最佳实践

- [TypeScript 最佳实践](https://typescript-eslint.io/rules/)
- [严格模式指南](https://www.typescriptlang.org/docs/handbook/2/basic-types.html#strictness)
- [项目引用指南](https://www.typescriptlang.org/docs/handbook/project-references.html)

### 工具链集成

- [Vite TypeScript 支持](https://vitejs.dev/guide/features.html#typescript)
- [React TypeScript 最佳实践](https://react-typescript-cheatsheet.netlify.app/)
- [Cloudflare Workers TypeScript](https://developers.cloudflare.com/workers/languages/typescript/)

## 🔗 相关链接

- [ESLint 配置包](../eslint/README.md)
- [UI 组件库](../ui/README.md)
- [类型定义包](../types/README.md)
- [前端应用](../../apps/web/README.md)
- [后端服务](../../apps/service/README.md)
- [项目根目录](../../README.md)
