# Types 共享类型包

这是一个共享的 TypeScript 类型定义包，为整个 monorepo 项目提供统一的类型定义。包含国际化类型、UI 组件类型等，确保所有项目之间的类型一致性和复用性。

## 📋 类型包概述

### 主要特色

- 🔄 **类型复用**：避免在多个项目中重复定义相同类型
- 🌍 **国际化类型**：完整的多语言支持类型定义
- 🎨 **UI 类型**：统一的 UI 组件接口和属性类型
- 📦 **模块化导出**：按功能模块组织类型定义
- 🔧 **类型安全**：提供严格的 TypeScript 类型检查
- 🚀 **易于扩展**：支持添加新的类型模块

### 设计理念

- **单一数据源**：确保类型定义的唯一性和一致性
- **模块化组织**：按功能域划分类型，便于维护和查找
- **语义化命名**：使用清晰、直观的类型名称
- **向前兼容**：谨慎处理类型变更，避免破坏性更新
- **文档完善**：为每个类型提供清晰的文档和使用示例

## 📁 项目结构详解

```
packages/types/
├── src/                       # 源代码目录
│   ├── i18n/                 # 国际化相关类型
│   │   └── index.ts          # 语言、本地化类型定义
│   ├── ui/                   # UI 组件相关类型
│   │   └── index.ts          # 组件属性、样式类型定义
│   └── common/               # 通用类型（可扩展）
│       └── index.ts          # 基础通用类型
├── package.json              # 包配置和导出
├── tsconfig.json            # TypeScript 配置
└── README.md                # 使用文档
```

## 🚀 使用指南

### package.json 配置说明

#### 导出配置

```json
{
  "exports": {
    "./i18n": "./src/i18n/index.ts", // 国际化类型
    "./ui": "./src/ui/index.ts" // UI 类型
  }
}
```

这个导出配置允许其他项目通过以下方式导入类型：

- `@repo/types/i18n` - 国际化相关类型
- `@repo/types/ui` - UI 组件相关类型

#### 核心脚本

```json
{
  "scripts": {
    "build": "tsc", // 编译类型检查
    "check-types": "tsc --noEmit", // 仅类型检查
    "lint": "eslint .", // 代码规范检查
    "format": "prettier --write ..." // 代码格式化
  }
}
```

### 在项目中使用类型

#### 1. 导入国际化类型

```typescript
// 导入语言类型
import type { Locale, LocaleInfo, LocaleData } from "@repo/types/i18n";

// 使用示例
const currentLocale: Locale = Locale.ZH_CN;

const localeInfo: LocaleInfo = {
  flag: "🇨🇳",
  name: "中文",
};

const allLocales: LocaleData = {
  [Locale.EN]: {
    flag: "🇺🇸",
    name: "English",
  },
  [Locale.ZH_CN]: {
    flag: "🇨🇳",
    name: "中文",
  },
};
```

#### 2. 导入 UI 类型

```typescript
// 导入 UI 组件类型
import type {
  ComponentSize,
  ComponentVariant,
  ButtonProps,
  ModalProps,
} from "@repo/types/ui";

// 使用示例
const buttonSize: ComponentSize = "large";
const buttonVariant: ComponentVariant = "primary";

interface CustomButtonProps extends ButtonProps {
  customProp?: string;
}
```

#### 3. 混合使用

```typescript
import type { Locale } from "@repo/types/i18n";
import type { ComponentSize } from "@repo/types/ui";

interface LocalizedButtonProps {
  locale: Locale;
  size: ComponentSize;
  label: string;
}

const button: LocalizedButtonProps = {
  locale: Locale.ZH_CN,
  size: "medium",
  label: "确认",
};
```

## 🔧 类型定义详解

### 国际化类型 (i18n)

#### 1. Locale 枚举

```typescript
export enum Locale {
  EN = "en", // 英语
  ZH_CN = "zh-CN", // 简体中文
}
```

**使用场景**：

- 语言切换功能
- 路由本地化
- 内容管理系统
- API 请求头设置

**扩展示例**：

```typescript
// 添加新语言
export enum Locale {
  EN = "en",
  ZH_CN = "zh-CN",
  JA = "ja", // 日语
  KO = "ko", // 韩语
  FR = "fr", // 法语
  ES = "es", // 西班牙语
}
```

#### 2. LocaleInfo 接口

```typescript
export interface LocaleInfo {
  flag: string; // 国旗 emoji 或图标
  name: string; // 语言显示名称
}
```

**使用示例**：

```typescript
const localeInfos: Record<Locale, LocaleInfo> = {
  [Locale.EN]: {
    flag: '🇺🇸',
    name: 'English'
  },
  [Locale.ZH_CN]: {
    flag: '🇨🇳',
    name: '简体中文'
  }
};

// 在组件中使用
function LanguageSwitcher() {
  return (
    <select>
      {Object.entries(localeInfos).map(([locale, info]) => (
        <option key={locale} value={locale}>
          {info.flag} {info.name}
        </option>
      ))}
    </select>
  );
}
```

#### 3. LocaleData 映射类型

```typescript
export type LocaleData = {
  [K in Locale]: LocaleInfo;
};
```

**类型安全保证**：

```typescript
// ✅ 类型安全 - 必须为每种语言提供信息
const completeLocaleData: LocaleData = {
  [Locale.EN]: { flag: "🇺🇸", name: "English" },
  [Locale.ZH_CN]: { flag: "🇨🇳", name: "中文" },
};

// ❌ 类型错误 - 缺少某种语言
const incompleteLocaleData: LocaleData = {
  [Locale.EN]: { flag: "🇺🇸", name: "English" },
  // 缺少 ZH_CN - TypeScript 会报错
};
```

### UI 组件类型 (ui)

#### 1. 基础组件类型

```typescript
// 组件尺寸枚举
export type ComponentSize = "small" | "medium" | "large" | "xl";

// 组件变体类型
export type ComponentVariant =
  | "primary"
  | "secondary"
  | "success"
  | "warning"
  | "error"
  | "info";

// 组件状态
export type ComponentState = "default" | "loading" | "disabled" | "error";

// 基础组件属性
export interface BaseComponentProps {
  className?: string;
  style?: React.CSSProperties;
  "data-testid"?: string;
}
```

#### 2. 按钮组件类型

```typescript
export interface ButtonProps extends BaseComponentProps {
  variant?: ComponentVariant;
  size?: ComponentSize;
  disabled?: boolean;
  loading?: boolean;
  type?: "button" | "submit" | "reset";
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  children: React.ReactNode;
}

// 使用示例
const primaryButton: ButtonProps = {
  variant: "primary",
  size: "large",
  onClick: (e) => console.log("Clicked!"),
  children: "提交",
};
```

#### 3. 表单组件类型

```typescript
export interface FormFieldProps extends BaseComponentProps {
  label?: string;
  error?: string;
  required?: boolean;
  disabled?: boolean;
  helperText?: string;
}

export interface InputProps extends FormFieldProps {
  type?: "text" | "email" | "password" | "number" | "tel" | "url";
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
  onBlur?: () => void;
  onFocus?: () => void;
}

export interface SelectProps extends FormFieldProps {
  options: Array<{
    label: string;
    value: string;
    disabled?: boolean;
  }>;
  value?: string;
  placeholder?: string;
  multiple?: boolean;
  onChange?: (value: string | string[]) => void;
}
```

#### 4. 布局组件类型

```typescript
export interface ContainerProps extends BaseComponentProps {
  maxWidth?: "sm" | "md" | "lg" | "xl" | "2xl" | "full";
  padding?: ComponentSize;
  centered?: boolean;
  children: React.ReactNode;
}

export interface GridProps extends BaseComponentProps {
  columns?: number | { sm?: number; md?: number; lg?: number };
  gap?: ComponentSize;
  children: React.ReactNode;
}

export interface FlexProps extends BaseComponentProps {
  direction?: "row" | "column";
  align?: "start" | "center" | "end" | "stretch";
  justify?: "start" | "center" | "end" | "between" | "around" | "evenly";
  wrap?: boolean;
  gap?: ComponentSize;
  children: React.ReactNode;
}
```

#### 5. 反馈组件类型

```typescript
export interface ModalProps extends BaseComponentProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  size?: ComponentSize;
  closeOnOverlay?: boolean;
  closeOnEscape?: boolean;
  children: React.ReactNode;
}

export interface ToastProps {
  id: string;
  type: ComponentVariant;
  title: string;
  message?: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export interface AlertProps extends BaseComponentProps {
  type: ComponentVariant;
  title: string;
  message?: string;
  closable?: boolean;
  onClose?: () => void;
  children?: React.ReactNode;
}
```

## 🛠 开发和维护

### 添加新类型

#### 1. 添加新的类型模块

```bash
# 创建新模块目录
mkdir src/api
touch src/api/index.ts

# 更新 package.json exports
```

```json
{
  "exports": {
    "./i18n": "./src/i18n/index.ts",
    "./ui": "./src/ui/index.ts",
    "./api": "./src/api/index.ts" // 新增 API 类型模块
  }
}
```

#### 2. API 类型模块示例

```typescript
// src/api/index.ts

// HTTP 方法类型
export type HttpMethod = "GET" | "POST" | "PUT" | "DELETE" | "PATCH";

// API 响应类型
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  };
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// API 请求配置
export interface ApiRequestConfig {
  method: HttpMethod;
  url: string;
  headers?: Record<string, string>;
  params?: Record<string, string | number | boolean>;
  data?: Record<string, unknown>;
  timeout?: number;
}

// 用户相关 API 类型
export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: "admin" | "user" | "guest";
  createdAt: string;
  updatedAt: string;
}

export interface CreateUserRequest {
  name: string;
  email: string;
  password: string;
}

export interface UpdateUserRequest {
  name?: string;
  email?: string;
  avatar?: string;
}

export type GetUsersResponse = ApiResponse<User[]>;
export type GetUserResponse = ApiResponse<User>;
export type CreateUserResponse = ApiResponse<User>;
```

#### 3. 通用工具类型

```typescript
// src/common/index.ts

// 基础 ID 类型
export type ID = string | number;

// 时间戳类型
export type Timestamp = string | number | Date;

// 可选字段类型工具
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

// 必需字段类型工具
export type Required<T, K extends keyof T> = Omit<T, K> & Required<Pick<T, K>>;

// 深度只读类型
export type DeepReadonly<T> = {
  readonly [P in keyof T]: T[P] extends (infer U)[]
    ? ReadonlyArray<DeepReadonly<U>>
    : T[P] extends object
      ? DeepReadonly<T[P]>
      : T[P];
};

// 键值对映射类型
export type KeyValuePair<
  K extends string | number | symbol = string,
  V = unknown,
> = {
  [key in K]: V;
};

// 分页相关类型
export interface PaginationRequest {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface PaginationResponse<T> {
  items: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// 表单相关类型
export interface FormField<T = string> {
  value: T;
  error?: string;
  touched: boolean;
  required?: boolean;
}

export type FormData<T> = {
  [K in keyof T]: FormField<T[K]>;
};

// 异步状态类型
export interface AsyncState<T = unknown, E = Error> {
  data?: T;
  loading: boolean;
  error?: E;
}
```

### 类型版本管理

#### 1. 语义化版本控制

```typescript
// 主版本更新 (Breaking Changes)
// v1.0.0 -> v2.0.0

// 旧版本
export interface User {
  id: string;
  name: string;
}

// 新版本 - 破坏性更改
export interface User {
  id: number; // 类型变更：string -> number
  fullName: string; // 字段重命名：name -> fullName
  email: string; // 新增必需字段
}
```

```typescript
// 次版本更新 (New Features)
// v1.0.0 -> v1.1.0

// 旧版本
export interface User {
  id: string;
  name: string;
}

// 新版本 - 向后兼容
export interface User {
  id: string;
  name: string;
  email?: string; // 新增可选字段
  avatar?: string; // 新增可选字段
}
```

```typescript
// 修订版本更新 (Bug Fixes)
// v1.0.0 -> v1.0.1

// 修复类型定义错误，不改变接口结构
export interface User {
  id: string;
  name: string;
  // 修复：添加缺失的文档注释
  /** 用户创建时间 */
  createdAt: string;
}
```

#### 2. 迁移指南

```typescript
// 提供类型迁移辅助工具
export namespace Migration {
  // v1 -> v2 用户类型迁移
  export function migrateUserV1ToV2(userV1: UserV1): UserV2 {
    return {
      id: parseInt(userV1.id), // string -> number
      fullName: userV1.name, // name -> fullName
      email: "", // 新增字段，需要默认值
      ...userV1,
    };
  }

  // 批量迁移
  export function migrateUsersV1ToV2(usersV1: UserV1[]): UserV2[] {
    return usersV1.map(migrateUserV1ToV2);
  }
}

// 版本标记类型
export type TypeVersion = "v1" | "v2";

// 版本化类型接口
export interface VersionedType<T, V extends TypeVersion> {
  version: V;
  data: T;
}
```

### 类型文档生成

#### 1. JSDoc 注释规范

````typescript
/**
 * 用户信息接口
 * @description 表示系统中用户的完整信息
 * @example
 * ```typescript
 * const user: User = {
 *   id: "user123",
 *   name: "张三",
 *   email: "zhangsan@example.com",
 *   role: "user",
 *   createdAt: "2024-01-01T00:00:00Z",
 *   updatedAt: "2024-01-01T00:00:00Z"
 * };
 * ```
 */
export interface User {
  /** 用户唯一标识符 */
  id: string;

  /**
   * 用户姓名
   * @minLength 1
   * @maxLength 50
   */
  name: string;

  /**
   * 用户邮箱地址
   * @format email
   */
  email: string;

  /**
   * 用户头像 URL
   * @format uri
   * @optional
   */
  avatar?: string;

  /**
   * 用户角色
   * @default "user"
   */
  role: "admin" | "user" | "guest";

  /**
   * 创建时间
   * @format date-time
   */
  createdAt: string;

  /**
   * 更新时间
   * @format date-time
   */
  updatedAt: string;
}
````

#### 2. 类型测试

```typescript
// src/__tests__/types.test.ts

import type { User, Locale, ButtonProps } from "../index";

// 类型测试辅助函数
function expectType<T>(value: T): T {
  return value;
}

// 用户类型测试
describe("User Types", () => {
  it("should accept valid user object", () => {
    const validUser = expectType<User>({
      id: "user123",
      name: "John Doe",
      email: "john@example.com",
      role: "user",
      createdAt: "2024-01-01T00:00:00Z",
      updatedAt: "2024-01-01T00:00:00Z",
    });

    expect(validUser).toBeDefined();
  });
});

// 语言类型测试
describe("Locale Types", () => {
  it("should contain expected locale values", () => {
    const enLocale = expectType<Locale>(Locale.EN);
    const zhLocale = expectType<Locale>(Locale.ZH_CN);

    expect(enLocale).toBe("en");
    expect(zhLocale).toBe("zh-CN");
  });
});
```

## ❓ 常见问题和解决方案

### 1. 类型导入失败

**问题**：`Cannot find module '@repo/types/i18n'`

**解决方案**：

```bash
# 确保类型包已正确安装和构建
cd packages/types
pnpm install
pnpm build

# 检查 exports 配置
cat package.json | grep -A 5 "exports"

# 在使用项目中重新安装
cd ../../apps/web
pnpm install
```

### 2. 类型冲突

**问题**：多个包定义了相同名称的类型

**解决方案**：

```typescript
// 使用命名空间避免冲突
export namespace UI {
  export interface ButtonProps {
    // UI 相关的按钮属性
  }
}

export namespace API {
  export interface ButtonProps {
    // API 相关的按钮数据
  }
}

// 使用时指定命名空间
import type { UI, API } from "@repo/types";

const uiButton: UI.ButtonProps = {
  /* ... */
};
const apiButton: API.ButtonProps = {
  /* ... */
};
```

### 3. 循环依赖

**问题**：类型定义之间出现循环引用

**解决方案**：

```typescript
// ❌ 循环依赖
// user.ts
import type { Post } from "./post";
export interface User {
  posts: Post[];
}

// post.ts
import type { User } from "./user";
export interface Post {
  author: User;
}

// ✅ 解决方案：使用前置声明或重构
// types.ts
export interface User {
  id: string;
  name: string;
  posts: Post[];
}

export interface Post {
  id: string;
  title: string;
  authorId: string; // 使用 ID 引用而不是直接引用对象
}
```

### 4. 类型过于复杂

**问题**：类型定义变得难以理解和维护

**解决方案**：

```typescript
// ❌ 复杂的类型定义
export type ComplexType<T, U, V> = T extends U
  ? V extends string
    ? { [K in keyof T]: T[K] extends infer R ? R : never }
    : never
  : never;

// ✅ 拆分为多个简单类型
export type ExtractKeys<T, U> = T extends U ? keyof T : never;
export type MapValues<T> = { [K in keyof T]: T[K] };
export type ConditionalMap<T, U, V> = T extends U ? MapValues<T> : V;
```

### 5. 类型更新兼容性

**问题**：类型更新后导致其他项目构建失败

**解决方案**：

```typescript
// 使用过渡期的兼容性类型
export interface UserV2 {
  id: number;
  fullName: string;
  email: string;
}

// 提供向后兼容的类型别名
/** @deprecated Use UserV2 instead */
export interface User extends Omit<UserV2, "id" | "fullName"> {
  /** @deprecated Use id (number) in UserV2 */
  id: string;
  /** @deprecated Use fullName in UserV2 */
  name: string;
}

// 类型转换工具
export function migrateUser(oldUser: User): UserV2 {
  return {
    id: parseInt(oldUser.id),
    fullName: oldUser.name,
    email: oldUser.email,
  };
}
```

## 📚 学习资源

### TypeScript 官方文档

- [TypeScript 手册](https://www.typescriptlang.org/docs/)
- [实用程序类型](https://www.typescriptlang.org/docs/handbook/utility-types.html)
- [高级类型](https://www.typescriptlang.org/docs/handbook/2/types-from-types.html)
- [模块系统](https://www.typescriptlang.org/docs/handbook/modules.html)

### 类型设计最佳实践

- [TypeScript 风格指南](https://google.github.io/styleguide/tsguide.html)
- [类型驱动开发](https://blog.logrocket.com/type-driven-development-typescript/)
- [API 设计最佳实践](https://docs.microsoft.com/en-us/azure/architecture/best-practices/api-design)

### 工具和库

- [TypeScript ESLint](https://typescript-eslint.io/)
- [ts-node](https://typestrong.org/ts-node/)
- [type-fest](https://github.com/sindresorhus/type-fest) - 实用类型集合

## 🔗 相关链接

- [ESLint 配置包](../eslint/README.md)
- [TypeScript 配置包](../tsconfig/README.md)
- [UI 组件库](../ui/README.md)
- [前端应用](../../apps/web/README.md)
- [后端服务](../../apps/service/README.md)
- [项目根目录](../../README.md)
