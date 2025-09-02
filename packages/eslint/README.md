# ESLint 配置包

这是一个共享的 ESLint 配置包，为整个 monorepo 项目提供统一的代码规范和质量检查。包含基础配置和 React 专用配置，确保所有项目遵循一致的代码风格和最佳实践。

## 📋 配置包概述

### 主要特色

- 🔧 **统一规范**：为所有项目提供一致的代码规范
- ⚛️ **React 支持**：专门的 React 项目配置
- 🏗️ **Turborepo 集成**：针对 monorepo 的特殊规则
- 📝 **TypeScript 优化**：完整的 TypeScript 支持和规则
- 🎨 **Prettier 集成**：自动解决格式化冲突
- 🚫 **错误转警告**：开发友好的错误处理

### 设计理念

- **一致性优先**：确保整个项目的代码风格统一
- **开发体验**：避免过于严格的规则影响开发效率
- **渐进式**：允许现有项目逐步采用新规范
- **可扩展**：支持项目特定的自定义规则
- **最佳实践**：集成业界公认的最佳实践规则

## 📁 项目结构详解

```
packages/eslint/
├── base.js                    # 基础 ESLint 配置
├── react.js                   # React 项目专用配置
├── eslint.config.js          # 本包的 ESLint 配置
├── package.json              # 依赖和导出配置
└── README.md                 # 使用文档
```

## 🚀 使用指南

### package.json 配置说明

#### 导出配置

```json
{
  "exports": {
    "./base": "./base.js", // 基础配置导出
    "./react": "./react.js" // React 配置导出
  }
}
```

这个导出配置允许其他项目通过以下方式导入：

- `@repo/eslint/base` - 基础配置（适用于所有 JavaScript/TypeScript 项目）
- `@repo/eslint/react` - React 配置（适用于 React 应用）

#### 核心依赖

```json
{
  "devDependencies": {
    "@eslint/js": "^9.33.0", // ESLint 官方 JavaScript 规则
    "@next/eslint-plugin-next": "^15.4.2", // Next.js 专用规则
    "eslint": "^9.33.0", // ESLint 核心
    "eslint-config-prettier": "^10.1.1", // Prettier 兼容配置
    "eslint-plugin-only-warn": "^1.1.0", // 错误转警告插件
    "eslint-plugin-react": "^7.37.5", // React 规则
    "eslint-plugin-react-hooks": "^5.2.0", // React Hooks 规则
    "eslint-plugin-turbo": "^2.5.0", // Turborepo 规则
    "globals": "^16.3.0", // 全局变量定义
    "typescript-eslint": "^8.39.0" // TypeScript ESLint 规则
  }
}
```

### 在项目中使用配置

#### 1. 基础项目配置

适用于纯 JavaScript/TypeScript 项目，如工具包、配置包等：

```javascript
// eslint.config.js
import { config } from "@repo/eslint/base";

export default [
  ...config,
  {
    // 项目特定的额外配置
    ignores: ["build/**", "dist/**"],
  },
];
```

**使用场景**：

- `packages/utils` - 工具函数包
- `packages/types` - 类型定义包
- `packages/tsconfig` - 配置包
- Node.js 后端项目

#### 2. React 项目配置

适用于使用 React 的前端项目：

```javascript
// eslint.config.js
import { config } from "@repo/eslint/react";

export default [
  ...config,
  {
    // React 项目特定配置
    settings: {
      react: {
        version: "detect", // 自动检测 React 版本
      },
    },
    rules: {
      // 自定义 React 规则
      "react/prop-types": "off", // 使用 TypeScript 时关闭 prop-types
    },
  },
];
```

**使用场景**：

- `apps/web` - React 前端应用
- `packages/ui` - React 组件库

#### 3. 自定义项目配置

为特定项目添加额外规则：

```javascript
// eslint.config.js
import { config } from "@repo/eslint/react";

export default [
  ...config,
  {
    // 针对特定文件的规则
    files: ["**/*.test.{js,jsx,ts,tsx}"],
    rules: {
      // 测试文件允许更宽松的规则
      "@typescript-eslint/no-explicit-any": "off",
    },
  },
  {
    // 针对配置文件的规则
    files: ["**/*.config.{js,ts}"],
    rules: {
      // 配置文件允许使用 require
      "@typescript-eslint/no-require-imports": "off",
    },
  },
];
```

## 🔧 配置详解

### 基础配置 (base.js)

基础配置提供了所有项目通用的代码规范：

#### 1. 核心配置组成

```javascript
export const config = [
  js.configs.recommended, // ESLint JavaScript 推荐规则
  eslintConfigPrettier, // Prettier 兼容设置
  ...tseslint.configs.recommended, // TypeScript 推荐规则

  // Turborepo 插件配置
  {
    plugins: {
      turbo: turboPlugin,
    },
    rules: {
      "turbo/no-undeclared-env-vars": "warn", // 检查未声明的环境变量
    },
  },

  // 错误转警告插件
  {
    plugins: {
      onlyWarn,
    },
  },

  // 忽略规则
  {
    ignores: ["dist/**"], // 忽略构建输出目录
  },
];
```

#### 2. 规则详解

**JavaScript 推荐规则** (`js.configs.recommended`)：

- `no-unused-vars`: 检查未使用的变量
- `no-undef`: 检查未定义的变量
- `no-redeclare`: 禁止重复声明
- `no-unreachable`: 检查不可达代码

**TypeScript 推荐规则** (`tseslint.configs.recommended`)：

- `@typescript-eslint/no-unused-vars`: TypeScript 版本的未使用变量检查
- `@typescript-eslint/no-explicit-any`: 避免使用 any 类型
- `@typescript-eslint/prefer-const`: 优先使用 const
- `@typescript-eslint/no-inferrable-types`: 避免不必要的类型声明

**Turborepo 规则**：

- `turbo/no-undeclared-env-vars`: 检查在 monorepo 中使用但未在 turbo.json 中声明的环境变量

#### 3. 使用示例

```typescript
// ✅ 正确的代码
const userName = "John";
let isActive: boolean = false;

function greetUser(name: string): string {
  return `Hello, ${name}!`;
}

// ❌ 会被 ESLint 警告的代码
const unusedVariable = "not used"; // 未使用的变量
let userName = "John";
userName = "Jane"; // 应该使用 const

function greetUser(name: any) {
  // 避免使用 any
  console.log(name);
  return; // 缺少返回值
}
```

### React 配置 (react.js)

React 配置在基础配置基础上添加了 React 特定的规则：

#### 1. 配置组成

```javascript
export const config = [
  ...baseConfig, // 继承基础配置
  js.configs.recommended,
  eslintConfigPrettier,
  ...tseslint.configs.recommended,
  pluginReact.configs.flat.recommended, // React 推荐规则

  // 语言选项配置
  {
    languageOptions: {
      ...pluginReact.configs.flat.recommended.languageOptions,
      globals: {
        ...globals.serviceworker, // Service Worker 全局变量
        ...globals.browser, // 浏览器全局变量
      },
    },
  },

  // React Hooks 规则
  {
    plugins: {
      "react-hooks": pluginReactHooks,
    },
    settings: {
      react: { version: "detect" }, // 自动检测 React 版本
    },
    rules: {
      ...pluginReactHooks.configs.recommended.rules,
      "react/react-in-jsx-scope": "off", // 新 JSX 转换不需要导入 React
    },
  },
];
```

#### 2. React 规则详解

**React 核心规则**：

- `react/jsx-uses-react`: 检查 React 的使用（新版本已关闭）
- `react/jsx-uses-vars`: 检查 JSX 中变量的使用
- `react/no-deprecated`: 禁止使用已废弃的 API
- `react/no-unknown-property`: 检查未知的 HTML 属性

**React Hooks 规则**：

- `react-hooks/rules-of-hooks`: 确保 Hooks 调用顺序正确
- `react-hooks/exhaustive-deps`: 检查 useEffect 依赖数组的完整性

#### 3. 使用示例

```tsx
// ✅ 正确的 React 代码
import { useState, useEffect } from "react";

interface UserProps {
  name: string;
  age: number;
}

export function UserComponent({ name, age }: UserProps) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    document.title = `Count: ${count}`;
  }, [count]); // 正确的依赖数组

  return (
    <div>
      <h1>
        {name} ({age})
      </h1>
      <button onClick={() => setCount(count + 1)}>Count: {count}</button>
    </div>
  );
}

// ❌ 会被 ESLint 警告的代码
export function BadComponent({ name }) {
  // 缺少类型定义
  const [count, setCount] = useState(0);
  const [user, setUser] = useState(null);

  useEffect(() => {
    setUser({ name, count });
  }, [name]); // ❌ 缺少 count 依赖

  // ❌ 条件性使用 Hook
  if (name) {
    const [extra, setExtra] = useState("");
  }

  return <div>{name}</div>;
}
```

## 🛠 开发和维护

### 添加新规则

#### 1. 修改基础配置

```javascript
// base.js
export const config = [
  // ... 现有配置
  {
    rules: {
      // 添加新的全局规则
      "prefer-const": "error",
      "no-console": "warn",
      "@typescript-eslint/explicit-function-return-type": "warn",
    },
  },
];
```

#### 2. 修改 React 配置

```javascript
// react.js
export const config = [
  // ... 现有配置
  {
    rules: {
      // 添加新的 React 规则
      "react/self-closing-comp": "error",
      "react/jsx-pascal-case": "error",
      "react/no-array-index-key": "warn",
    },
  },
];
```

### 添加新插件

#### 1. 安装插件

```bash
cd packages/eslint
pnpm add -D eslint-plugin-import
```

#### 2. 配置插件

```javascript
// base.js
import importPlugin from "eslint-plugin-import";

export const config = [
  // ... 现有配置
  {
    plugins: {
      import: importPlugin,
    },
    rules: {
      "import/no-unused-modules": "warn",
      "import/no-duplicates": "error",
      "import/order": [
        "error",
        {
          groups: [
            "builtin",
            "external",
            "internal",
            "parent",
            "sibling",
            "index",
          ],
          "newlines-between": "always",
        },
      ],
    },
  },
];
```

#### 3. 更新 package.json

```json
{
  "devDependencies": {
    "eslint-plugin-import": "^2.29.0"
  }
}
```

### 版本管理和更新

#### 1. 更新依赖

```bash
# 检查过期依赖
pnpm outdated

# 更新所有依赖到最新版本
pnpm update

# 更新特定依赖
pnpm update eslint typescript-eslint
```

#### 2. 测试配置

```bash
# 在当前包中测试
pnpm lint

# 在使用该配置的项目中测试
cd ../../apps/web
pnpm lint

cd ../../apps/service
pnpm lint
```

#### 3. 发布新版本

```bash
# 提交配置更改
git add .
git commit -m "feat(eslint): add new import rules"

# 在项目根目录运行所有检查
cd ../..
pnpm lint
pnpm check-types
```

## 🔍 规则配置指南

### 常用规则配置

#### 1. TypeScript 项目规则

```javascript
{
  rules: {
    // 类型相关
    "@typescript-eslint/no-explicit-any": "warn",
    "@typescript-eslint/no-unused-vars": ["error", { "argsIgnorePattern": "^_" }],
    "@typescript-eslint/explicit-function-return-type": "off",
    "@typescript-eslint/no-inferrable-types": "error",

    // 代码质量
    "prefer-const": "error",
    "no-var": "error",
    "no-console": "warn",
    "no-debugger": "error"
  }
}
```

#### 2. React 项目规则

```javascript
{
  rules: {
    // JSX 相关
    "react/jsx-uses-react": "off",
    "react/react-in-jsx-scope": "off",
    "react/self-closing-comp": "error",
    "react/jsx-pascal-case": "error",

    // Hooks 相关
    "react-hooks/rules-of-hooks": "error",
    "react-hooks/exhaustive-deps": "warn",

    // Props 相关
    "react/prop-types": "off", // 使用 TypeScript 时关闭
    "react/require-default-props": "off"
  }
}
```

#### 3. 导入相关规则

```javascript
{
  rules: {
    // 导入顺序
    "import/order": ["error", {
      "groups": [
        "builtin",
        "external",
        "internal",
        "parent",
        "sibling",
        "index"
      ],
      "newlines-between": "always",
      "alphabetize": {
        "order": "asc",
        "caseInsensitive": true
      }
    }],

    // 导入规范
    "import/no-duplicates": "error",
    "import/no-unused-modules": "warn",
    "import/no-cycle": "error"
  }
}
```

### 项目特定配置

#### 1. 测试文件配置

```javascript
{
  files: ["**/*.{test,spec}.{js,jsx,ts,tsx}"],
  rules: {
    "@typescript-eslint/no-explicit-any": "off",
    "no-console": "off",
    "react-hooks/rules-of-hooks": "off"
  }
}
```

#### 2. 配置文件规则

```javascript
{
  files: ["**/*.config.{js,ts}", "**/webpack.*.js", "**/vite.*.js"],
  rules: {
    "@typescript-eslint/no-require-imports": "off",
    "no-console": "off"
  }
}
```

#### 3. 类型定义文件

```javascript
{
  files: ["**/*.d.ts"],
  rules: {
    "@typescript-eslint/no-explicit-any": "off",
    "@typescript-eslint/no-unused-vars": "off"
  }
}
```

## 🐛 常见问题和解决方案

### 1. 配置加载失败

**问题**：`Failed to load config "@repo/eslint/base"`

**解决方案**：

```bash
# 确保配置包已正确安装
cd packages/eslint
pnpm install

# 检查 exports 配置
cat package.json | grep -A 5 "exports"

# 在使用项目中重新安装
cd ../../apps/web
pnpm install
```

### 2. TypeScript 规则不生效

**问题**：TypeScript 相关规则没有生效

**解决方案**：

```javascript
// eslint.config.js
export default [
  ...config,
  {
    languageOptions: {
      parserOptions: {
        project: true, // 启用类型检查
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
];
```

### 3. React 规则冲突

**问题**：React 规则与项目代码冲突

**解决方案**：

```javascript
// eslint.config.js
export default [
  ...reactConfig,
  {
    settings: {
      react: {
        version: "18.0", // 明确指定 React 版本
      },
    },
    rules: {
      "react/react-in-jsx-scope": "off", // 关闭冲突规则
    },
  },
];
```

### 4. 性能问题

**问题**：ESLint 运行速度很慢

**解决方案**：

```javascript
// eslint.config.js
export default [
  ...config,
  {
    ignores: [
      "dist/**",
      "build/**",
      "node_modules/**",
      "**/*.min.js",
      ".next/**",
      ".turbo/**",
    ],
  },
];
```

### 5. Monorepo 环境变量问题

**问题**：`turbo/no-undeclared-env-vars` 误报

**解决方案**：

```javascript
// turbo.json (在项目根目录)
{
  "globalEnv": ["NODE_ENV", "NEXT_PUBLIC_*"],
  "tasks": {
    "build": {
      "env": ["DATABASE_URL", "API_KEY"]
    }
  }
}
```

或者在 ESLint 配置中关闭：

```javascript
// eslint.config.js
export default [
  ...config,
  {
    rules: {
      "turbo/no-undeclared-env-vars": "off",
    },
  },
];
```

## 📚 学习资源

### 官方文档

- [ESLint 官方文档](https://eslint.org/docs/)
- [TypeScript ESLint 文档](https://typescript-eslint.io/)
- [React ESLint 插件](https://github.com/jsx-eslint/eslint-plugin-react)
- [React Hooks ESLint 插件](https://www.npmjs.com/package/eslint-plugin-react-hooks)

### 配置指南

- [ESLint 配置文件格式](https://eslint.org/docs/user-guide/configuring/)
- [Flat Config 迁移指南](https://eslint.org/docs/latest/use/configure/migration-guide)
- [插件开发指南](https://eslint.org/docs/developer-guide/working-with-plugins)

### 最佳实践

- [Airbnb JavaScript 风格指南](https://github.com/airbnb/javascript)
- [Google JavaScript 风格指南](https://google.github.io/styleguide/jsguide.html)
- [React 最佳实践](https://react.dev/learn/thinking-in-react)

## 🔗 相关链接

- [TypeScript 配置包](../tsconfig/README.md)
- [UI 组件库](../ui/README.md)
- [前端应用](../../apps/web/README.md)
- [后端服务](../../apps/service/README.md)
- [项目根目录](../../README.md)
