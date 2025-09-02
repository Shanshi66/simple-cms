# Utils 工具函数包

这是一个共享的工具函数包，为整个 monorepo 项目提供统一的工具函数和实用程序。包含样式工具、数据处理、日期格式化、验证函数等，提高代码复用性和开发效率。

## 📋 工具包概述

### 主要特色

- 🔧 **统一工具**：避免在多个项目中重复实现相同功能
- 🎨 **样式工具**：基于 clsx 和 tailwind-merge 的样式处理
- 📊 **数据处理**：常用的数据转换和操作函数
- 🕐 **时间工具**：日期格式化、计算和验证
- ✅ **验证函数**：邮箱、电话、URL 等常见格式验证
- 🚀 **性能优化**：防抖、节流等性能优化工具
- 📱 **响应式工具**：设备检测、断点判断等

### 设计理念

- **纯函数优先**：大部分函数都是纯函数，易于测试和调试
- **类型安全**：完整的 TypeScript 类型定义
- **轻量化**：最小化依赖，避免过度封装
- **可摇树**：支持 tree-shaking，按需导入
- **向后兼容**：API 设计考虑向前兼容性
- **文档完善**：每个函数都有清晰的文档和使用示例

## 📁 项目结构详解

```
packages/utils/
├── src/                       # 源代码目录
│   ├── style.ts              # 样式相关工具函数
│   ├── string.ts             # 字符串处理工具
│   ├── number.ts             # 数字处理工具
│   ├── date.ts               # 日期时间工具
│   ├── array.ts              # 数组操作工具
│   ├── object.ts             # 对象操作工具
│   ├── validation.ts         # 数据验证工具
│   ├── performance.ts        # 性能优化工具
│   ├── device.ts             # 设备检测工具
│   ├── url.ts                # URL 处理工具
│   ├── storage.ts            # 存储相关工具
│   ├── format.ts             # 格式化工具
│   └── index.ts              # 统一导出入口
├── __tests__/                # 测试文件目录
├── package.json              # 包配置
├── tsconfig.json            # TypeScript 配置
└── README.md                # 使用文档
```

## 🚀 使用指南

### package.json 配置说明

#### 导出配置

```json
{
  "exports": {
    ".": "./src" // 导出整个 src 目录
  }
}
```

#### 核心依赖

```json
{
  "dependencies": {
    "clsx": "^2.1.1", // 条件性类名工具
    "tailwind-merge": "^3.3.1" // Tailwind CSS 类名合并工具
  }
}
```

### 在项目中使用工具函数

#### 1. 按需导入

```typescript
// 导入特定工具函数
import { cn, debounce, formatDate } from "@repo/utils";

// 使用样式工具
const className = cn(
  "px-4 py-2",
  "bg-blue-500 hover:bg-blue-600",
  isActive && "ring-2 ring-blue-300",
);

// 使用防抖函数
const debouncedSearch = debounce((query: string) => {
  // 搜索逻辑
}, 300);

// 使用日期格式化
const formattedDate = formatDate(new Date(), "YYYY-MM-DD");
```

#### 2. 分类导入

```typescript
// 按功能分类导入
import * as StringUtils from "@repo/utils/string";
import * as DateUtils from "@repo/utils/date";
import * as ValidationUtils from "@repo/utils/validation";

// 使用字符串工具
const slug = StringUtils.slugify("Hello World!"); // 'hello-world'

// 使用日期工具
const isToday = DateUtils.isToday(new Date());

// 使用验证工具
const isValid = ValidationUtils.isEmail("user@example.com");
```

#### 3. 完整导入

```typescript
// 导入所有工具函数
import * as Utils from "@repo/utils";

const result = Utils.pipe(
  Utils.trim,
  Utils.capitalize,
  Utils.slugify,
)("  hello world  "); // 'Hello-world'
```

## 🔧 工具函数详解

### 样式工具 (style.ts)

#### 1. cn 函数 - 类名合并

```typescript
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * 合并类名的工具函数，结合 clsx 和 tailwind-merge
 * @param inputs 类名输入
 * @returns 合并后的类名字符串
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
```

**使用示例**：

```typescript
// 基本使用
cn("px-4 py-2", "bg-blue-500"); // 'px-4 py-2 bg-blue-500'

// 条件性类名
cn("base-class", {
  "active-class": isActive,
  "disabled-class": isDisabled,
});

// Tailwind 冲突处理
cn("px-2 px-4"); // 'px-4' (自动解决冲突)

// 复杂组合
cn(
  "btn",
  size === "sm" && "btn-sm",
  size === "lg" && "btn-lg",
  variant === "primary" && "btn-primary",
  className, // 外部传入的类名
);
```

#### 2. 样式变体工具

```typescript
/**
 * 创建样式变体的工具函数
 */
export function createVariants<
  T extends Record<string, Record<string, string>>,
>(base: string, variants: T) {
  return (
    props: Partial<{ [K in keyof T]: keyof T[K] }> & { className?: string },
  ) => {
    const variantClasses = Object.entries(variants)
      .map(([key, values]) => {
        const value = props[key as keyof typeof props];
        return value ? values[value as string] : "";
      })
      .filter(Boolean);

    return cn(base, ...variantClasses, props.className);
  };
}

// 使用示例
const buttonVariants = createVariants(
  "inline-flex items-center justify-center rounded-md font-medium transition-colors",
  {
    variant: {
      default: "bg-primary text-primary-foreground hover:bg-primary/90",
      destructive:
        "bg-destructive text-destructive-foreground hover:bg-destructive/90",
      outline:
        "border border-input hover:bg-accent hover:text-accent-foreground",
    },
    size: {
      default: "h-10 px-4 py-2",
      sm: "h-9 rounded-md px-3",
      lg: "h-11 rounded-md px-8",
      icon: "h-10 w-10",
    },
  },
);

// 生成按钮样式
const className = buttonVariants({
  variant: "outline",
  size: "lg",
  className: "my-custom-class",
});
```

### 字符串工具 (string.ts)

#### 1. 基础字符串处理

```typescript
/**
 * 移除字符串首尾空白字符
 */
export function trim(str: string): string {
  return str.trim();
}

/**
 * 首字母大写
 */
export function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

/**
 * 转换为驼峰命名
 */
export function camelCase(str: string): string {
  return str
    .replace(/(?:^\w|[A-Z]|\b\w)/g, (word, index) =>
      index === 0 ? word.toLowerCase() : word.toUpperCase(),
    )
    .replace(/\s+/g, "");
}

/**
 * 转换为短横线命名
 */
export function kebabCase(str: string): string {
  return str
    .replace(/([a-z])([A-Z])/g, "$1-$2")
    .replace(/[\s_]+/g, "-")
    .toLowerCase();
}

/**
 * 生成 URL 友好的 slug
 */
export function slugify(str: string): string {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "") // 移除特殊字符
    .replace(/[\s_-]+/g, "-") // 替换空格和下划线为短横线
    .replace(/^-+|-+$/g, ""); // 移除首尾短横线
}
```

#### 2. 高级字符串操作

```typescript
/**
 * 截断字符串并添加省略号
 */
export function truncate(str: string, length: number, suffix = "..."): string {
  if (str.length <= length) return str;
  return str.slice(0, length - suffix.length) + suffix;
}

/**
 * 提取字符串中的数字
 */
export function extractNumbers(str: string): number[] {
  return str.match(/\d+/g)?.map(Number) || [];
}

/**
 * 判断字符串是否为空或只包含空白字符
 */
export function isEmpty(str: string): boolean {
  return !str || !str.trim();
}

/**
 * 模板字符串替换
 */
export function template(
  str: string,
  variables: Record<string, string>,
): string {
  return str.replace(/\{\{(\w+)\}\}/g, (match, key) => variables[key] || match);
}

// 使用示例
const message = template("Hello {{name}}, welcome to {{app}}!", {
  name: "John",
  app: "MyApp",
}); // 'Hello John, welcome to MyApp!'
```

### 数字工具 (number.ts)

#### 1. 数字格式化

```typescript
/**
 * 格式化数字为货币
 */
export function formatCurrency(
  value: number,
  currency = "CNY",
  locale = "zh-CN",
): string {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
  }).format(value);
}

/**
 * 格式化数字为百分比
 */
export function formatPercent(value: number, decimals = 2): string {
  return `${(value * 100).toFixed(decimals)}%`;
}

/**
 * 数字千位分隔符
 */
export function formatNumber(value: number, locale = "zh-CN"): string {
  return new Intl.NumberFormat(locale).format(value);
}

/**
 * 文件大小格式化
 */
export function formatFileSize(bytes: number): string {
  const units = ["B", "KB", "MB", "GB", "TB"];
  let size = bytes;
  let unitIndex = 0;

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }

  return `${size.toFixed(1)} ${units[unitIndex]}`;
}
```

#### 2. 数字计算

```typescript
/**
 * 限制数字在指定范围内
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/**
 * 生成指定范围内的随机数
 */
export function randomBetween(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * 计算百分比
 */
export function percentage(value: number, total: number): number {
  return total === 0 ? 0 : (value / total) * 100;
}

/**
 * 四舍五入到指定小数位
 */
export function round(value: number, decimals = 2): number {
  const factor = Math.pow(10, decimals);
  return Math.round(value * factor) / factor;
}
```

### 日期时间工具 (date.ts)

#### 1. 日期格式化

```typescript
/**
 * 格式化日期
 */
export function formatDate(
  date: Date | string | number,
  format: string = "YYYY-MM-DD",
): string {
  const d = new Date(date);

  const formatMap: Record<string, string> = {
    YYYY: d.getFullYear().toString(),
    MM: (d.getMonth() + 1).toString().padStart(2, "0"),
    DD: d.getDate().toString().padStart(2, "0"),
    HH: d.getHours().toString().padStart(2, "0"),
    mm: d.getMinutes().toString().padStart(2, "0"),
    ss: d.getSeconds().toString().padStart(2, "0"),
  };

  return format.replace(/YYYY|MM|DD|HH|mm|ss/g, (match) => formatMap[match]);
}

/**
 * 相对时间格式化（多久前）
 */
export function formatRelativeTime(date: Date | string | number): string {
  const now = new Date();
  const target = new Date(date);
  const diffMs = now.getTime() - target.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffSec < 60) return "刚刚";
  if (diffMin < 60) return `${diffMin}分钟前`;
  if (diffHour < 24) return `${diffHour}小时前`;
  if (diffDay < 30) return `${diffDay}天前`;

  return formatDate(target, "YYYY-MM-DD");
}
```

#### 2. 日期计算

```typescript
/**
 * 判断是否为今天
 */
export function isToday(date: Date | string | number): boolean {
  const today = new Date();
  const target = new Date(date);
  return today.toDateString() === target.toDateString();
}

/**
 * 判断是否为工作日
 */
export function isWeekday(date: Date | string | number): boolean {
  const day = new Date(date).getDay();
  return day > 0 && day < 6;
}

/**
 * 获取月份的天数
 */
export function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate();
}

/**
 * 添加天数
 */
export function addDays(date: Date | string | number, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}
```

### 数组工具 (array.ts)

#### 1. 数组操作

```typescript
/**
 * 数组去重
 */
export function unique<T>(array: T[]): T[] {
  return [...new Set(array)];
}

/**
 * 根据属性去重
 */
export function uniqueBy<T>(array: T[], key: keyof T): T[] {
  const seen = new Set();
  return array.filter((item) => {
    const value = item[key];
    if (seen.has(value)) return false;
    seen.add(value);
    return true;
  });
}

/**
 * 数组分块
 */
export function chunk<T>(array: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
}

/**
 * 数组乱序
 */
export function shuffle<T>(array: T[]): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}
```

#### 2. 数组查找和统计

```typescript
/**
 * 根据条件查找项目
 */
export function findBy<T>(
  array: T[],
  predicate: (item: T) => boolean,
): T | undefined {
  return array.find(predicate);
}

/**
 * 根据条件统计数量
 */
export function countBy<T>(
  array: T[],
  predicate: (item: T) => boolean,
): number {
  return array.filter(predicate).length;
}

/**
 * 按属性分组
 */
export function groupBy<T>(array: T[], key: keyof T): Record<string, T[]> {
  return array.reduce(
    (groups, item) => {
      const groupKey = String(item[key]);
      groups[groupKey] = groups[groupKey] || [];
      groups[groupKey].push(item);
      return groups;
    },
    {} as Record<string, T[]>,
  );
}

/**
 * 数组求和
 */
export function sum(array: number[]): number {
  return array.reduce((total, num) => total + num, 0);
}

/**
 * 数组平均值
 */
export function average(array: number[]): number {
  return array.length === 0 ? 0 : sum(array) / array.length;
}
```

### 对象工具 (object.ts)

#### 1. 对象操作

```typescript
/**
 * 深度克隆对象
 */
export function deepClone<T>(obj: T): T {
  if (obj === null || typeof obj !== "object") return obj;
  if (obj instanceof Date) return new Date(obj.getTime()) as unknown as T;
  if (obj instanceof Array)
    return obj.map((item) => deepClone(item)) as unknown as T;

  const cloned = {} as T;
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      cloned[key] = deepClone(obj[key]);
    }
  }
  return cloned;
}

/**
 * 深度合并对象
 */
export function deepMerge<T extends Record<string, any>>(
  target: T,
  ...sources: Partial<T>[]
): T {
  if (!sources.length) return target;
  const source = sources.shift();

  if (isObject(target) && isObject(source)) {
    for (const key in source) {
      if (isObject(source[key])) {
        if (!target[key]) Object.assign(target, { [key]: {} });
        deepMerge(target[key], source[key]);
      } else {
        Object.assign(target, { [key]: source[key] });
      }
    }
  }

  return deepMerge(target, ...sources);
}

/**
 * 选择对象的指定属性
 */
export function pick<T, K extends keyof T>(obj: T, keys: K[]): Pick<T, K> {
  const result = {} as Pick<T, K>;
  keys.forEach((key) => {
    if (key in obj) {
      result[key] = obj[key];
    }
  });
  return result;
}

/**
 * 排除对象的指定属性
 */
export function omit<T, K extends keyof T>(obj: T, keys: K[]): Omit<T, K> {
  const result = { ...obj };
  keys.forEach((key) => {
    delete result[key];
  });
  return result;
}
```

### 验证工具 (validation.ts)

#### 1. 格式验证

```typescript
/**
 * 邮箱格式验证
 */
export function isEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * 手机号码验证（中国）
 */
export function isPhoneNumber(phone: string): boolean {
  const phoneRegex = /^1[3-9]\d{9}$/;
  return phoneRegex.test(phone);
}

/**
 * URL 格式验证
 */
export function isUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * 身份证号码验证（中国）
 */
export function isIdCard(idCard: string): boolean {
  const idCardRegex =
    /^[1-9]\d{5}(18|19|20)\d{2}(0[1-9]|1[0-2])(0[1-9]|[12]\d|3[01])\d{3}[\dXx]$/;
  return idCardRegex.test(idCard);
}
```

#### 2. 内容验证

```typescript
/**
 * 密码强度验证
 */
export function validatePassword(password: string): {
  isValid: boolean;
  score: number;
  feedback: string[];
} {
  const feedback: string[] = [];
  let score = 0;

  if (password.length >= 8) score++;
  else feedback.push("密码长度至少8位");

  if (/[a-z]/.test(password)) score++;
  else feedback.push("包含小写字母");

  if (/[A-Z]/.test(password)) score++;
  else feedback.push("包含大写字母");

  if (/\d/.test(password)) score++;
  else feedback.push("包含数字");

  if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score++;
  else feedback.push("包含特殊字符");

  return {
    isValid: score >= 3,
    score,
    feedback,
  };
}

/**
 * 检查是否为空值
 */
export function isEmpty(value: unknown): boolean {
  if (value === null || value === undefined) return true;
  if (typeof value === "string") return value.trim().length === 0;
  if (Array.isArray(value)) return value.length === 0;
  if (typeof value === "object") return Object.keys(value).length === 0;
  return false;
}
```

### 性能优化工具 (performance.ts)

#### 1. 防抖和节流

```typescript
/**
 * 防抖函数
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number,
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout;

  return function (...args: Parameters<T>) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func.apply(this, args), wait);
  };
}

/**
 * 节流函数
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number,
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;

  return function (...args: Parameters<T>) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

/**
 * 缓存函数结果
 */
export function memoize<T extends (...args: any[]) => any>(func: T): T {
  const cache = new Map();

  return ((...args: Parameters<T>) => {
    const key = JSON.stringify(args);
    if (cache.has(key)) {
      return cache.get(key);
    }

    const result = func.apply(this, args);
    cache.set(key, result);
    return result;
  }) as T;
}
```

### 设备检测工具 (device.ts)

#### 1. 设备类型检测

```typescript
/**
 * 检测是否为移动设备
 */
export function isMobile(): boolean {
  if (typeof window === "undefined") return false;
  return /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent,
  );
}

/**
 * 检测是否为平板设备
 */
export function isTablet(): boolean {
  if (typeof window === "undefined") return false;
  return /iPad|Android(?=.*Tablet)|Windows(?=.*Touch)/i.test(
    navigator.userAgent,
  );
}

/**
 * 检测浏览器类型
 */
export function getBrowser(): string {
  if (typeof window === "undefined") return "unknown";

  const userAgent = navigator.userAgent;
  if (userAgent.includes("Chrome")) return "Chrome";
  if (userAgent.includes("Firefox")) return "Firefox";
  if (userAgent.includes("Safari")) return "Safari";
  if (userAgent.includes("Edge")) return "Edge";
  return "unknown";
}

/**
 * 检测操作系统
 */
export function getOS(): string {
  if (typeof window === "undefined") return "unknown";

  const userAgent = navigator.userAgent;
  if (userAgent.includes("Windows")) return "Windows";
  if (userAgent.includes("Mac")) return "macOS";
  if (userAgent.includes("Linux")) return "Linux";
  if (userAgent.includes("Android")) return "Android";
  if (userAgent.includes("iOS")) return "iOS";
  return "unknown";
}
```

## 🛠 开发和维护

### 添加新工具函数

#### 1. 创建新功能模块

```bash
# 创建新的工具模块
touch src/crypto.ts
```

```typescript
// src/crypto.ts

/**
 * 生成UUID
 */
export function generateUUID(): string {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * 生成随机字符串
 */
export function generateRandomString(length: number): string {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * 简单哈希函数
 */
export function simpleHash(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // 转换为32位整数
  }
  return Math.abs(hash).toString(36);
}
```

#### 2. 更新主入口文件

```typescript
// src/index.ts
export * from "./style";
export * from "./string";
export * from "./number";
export * from "./date";
export * from "./array";
export * from "./object";
export * from "./validation";
export * from "./performance";
export * from "./device";
export * from "./crypto"; // 新增模块
```

### 单元测试

#### 1. 测试文件结构

```
__tests__/
├── style.test.ts
├── string.test.ts
├── number.test.ts
├── date.test.ts
├── array.test.ts
├── object.test.ts
├── validation.test.ts
├── performance.test.ts
└── device.test.ts
```

#### 2. 测试示例

```typescript
// __tests__/string.test.ts
import { capitalize, slugify, truncate, template } from "../src/string";

describe("String Utils", () => {
  describe("capitalize", () => {
    it("should capitalize first letter", () => {
      expect(capitalize("hello")).toBe("Hello");
      expect(capitalize("HELLO")).toBe("Hello");
      expect(capitalize("")).toBe("");
    });
  });

  describe("slugify", () => {
    it("should convert to URL-friendly slug", () => {
      expect(slugify("Hello World!")).toBe("hello-world");
      expect(slugify("  Multiple   Spaces  ")).toBe("multiple-spaces");
      expect(slugify("Special@#$%Characters")).toBe("specialcharacters");
    });
  });

  describe("truncate", () => {
    it("should truncate long strings", () => {
      expect(truncate("Hello World", 5)).toBe("He...");
      expect(truncate("Hi", 10)).toBe("Hi");
      expect(truncate("Hello World", 5, "***")).toBe("He***");
    });
  });

  describe("template", () => {
    it("should replace template variables", () => {
      const result = template("Hello {{name}}!", { name: "John" });
      expect(result).toBe("Hello John!");

      const complex = template("{{greeting}} {{name}}, welcome to {{app}}!", {
        greeting: "Hi",
        name: "Alice",
        app: "MyApp",
      });
      expect(complex).toBe("Hi Alice, welcome to MyApp!");
    });
  });
});
```

### 性能优化

#### 1. 树摇优化支持

```typescript
// 确保每个函数都可以被独立导入
// ✅ 好的做法
export function functionA() {
  /* ... */
}
export function functionB() {
  /* ... */
}

// ❌ 避免的做法
export default {
  functionA() {
    /* ... */
  },
  functionB() {
    /* ... */
  },
};
```

#### 2. 类型优化

```typescript
// 使用泛型提供更好的类型推断
export function groupBy<T, K extends keyof T>(
  array: T[],
  key: K,
): Record<string, T[]> {
  // 实现
}

// 使用重载提供多种使用方式
export function formatDate(date: Date): string;
export function formatDate(date: Date, format: string): string;
export function formatDate(date: string, format?: string): string;
export function formatDate(
  date: Date | string,
  format: string = "YYYY-MM-DD",
): string {
  // 实现
}
```

## ❓ 常见问题和解决方案

### 1. 工具函数导入失败

**问题**：`Cannot resolve module '@repo/utils'`

**解决方案**：

```bash
# 确保工具包已正确安装
cd packages/utils
pnpm install
pnpm build

# 检查导出配置
cat package.json | grep -A 3 "exports"
```

### 2. 类型定义缺失

**问题**：TypeScript 找不到工具函数的类型定义

**解决方案**：

```typescript
// 确保每个函数都有完整的类型定义
export function myFunction(param1: string, param2?: number): string {
  // 实现
}

// 为复杂函数添加 JSDoc 注释
/**
 * 复杂的工具函数
 * @param data - 输入数据
 * @param options - 配置选项
 * @returns 处理后的结果
 */
export function complexFunction<T>(
  data: T[],
  options: {
    transform?: (item: T) => T;
    filter?: (item: T) => boolean;
  } = {},
): T[] {
  // 实现
}
```

### 3. 浏览器兼容性问题

**问题**：某些工具函数在旧浏览器中不工作

**解决方案**：

```typescript
// 添加兼容性检查
export function copyToClipboard(text: string): Promise<boolean> {
  if (navigator.clipboard) {
    // 现代浏览器
    return navigator.clipboard
      .writeText(text)
      .then(() => true)
      .catch(() => false);
  }

  // 降级方案
  const textArea = document.createElement("textarea");
  textArea.value = text;
  document.body.appendChild(textArea);
  textArea.focus();
  textArea.select();

  try {
    const successful = document.execCommand("copy");
    document.body.removeChild(textArea);
    return Promise.resolve(successful);
  } catch (err) {
    document.body.removeChild(textArea);
    return Promise.resolve(false);
  }
}
```

### 4. 服务端渲染(SSR)兼容性

**问题**：某些工具函数在服务端环境中报错

**解决方案**：

```typescript
// 添加环境检查
export function getWindowSize(): { width: number; height: number } {
  if (typeof window === "undefined") {
    return { width: 0, height: 0 };
  }

  return {
    width: window.innerWidth,
    height: window.innerHeight,
  };
}

// 使用 isomorphic 模式
export function getUserAgent(): string {
  if (typeof navigator !== "undefined") {
    return navigator.userAgent;
  }

  // 服务端环境下的处理
  return "Server";
}
```

## 📚 学习资源

### JavaScript/TypeScript 工具库

- [Lodash](https://lodash.com/) - 经典的 JavaScript 工具库
- [Ramda](https://ramdajs.com/) - 函数式编程工具库
- [date-fns](https://date-fns.org/) - 现代化日期处理库
- [Validator.js](https://github.com/validatorjs/validator.js) - 字符串验证库

### 性能和优化

- [Web Performance API](https://developer.mozilla.org/zh-CN/docs/Web/API/Performance)
- [JavaScript 性能优化](https://web.dev/fast/)
- [Bundle 分析工具](https://bundlephobia.com/)

### 测试和质量

- [Jest 测试框架](https://jestjs.io/)
- [Testing Library](https://testing-library.com/)
- [TypeScript 最佳实践](https://typescript-eslint.io/rules/)

## 🔗 相关链接

- [ESLint 配置包](../eslint/README.md)
- [TypeScript 配置包](../tsconfig/README.md)
- [类型定义包](../types/README.md)
- [UI 组件库](../ui/README.md)
- [前端应用](../../apps/web/README.md)
- [后端服务](../../apps/service/README.md)
- [项目根目录](../../README.md)
