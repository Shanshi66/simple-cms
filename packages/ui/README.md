# UI 组件库

这是基于 shadcn/ui 构建的现代化 React 组件库，提供了高质量、可复用的 UI 组件，使用 Tailwind CSS 4 进行样式设计，支持主题定制和国际化。

## 📋 组件库概述

### 主要特色

- 🎨 **shadcn/ui 基础**：基于业界领先的 shadcn/ui 组件系统
- 🎯 **Headless UI**：使用 Radix UI 提供无障碍访问支持
- 🌈 **Tailwind CSS 4**：最新版本的原子化 CSS 框架
- 🌍 **国际化支持**：内置 i18next 多语言支持
- 🔧 **类型安全**：完整的 TypeScript 类型定义
- 📱 **响应式设计**：支持各种屏幕尺寸的自适应布局

### 设计原则

- **一致性**：统一的视觉语言和交互模式
- **可访问性**：遵循 WCAG 无障碍访问标准
- **可复用性**：高度抽象的组件设计，支持多场景使用
- **可定制性**：灵活的主题系统和样式覆盖
- **性能优先**：轻量级实现，按需导入

## 📁 项目结构详解

```
packages/ui/
├── src/                           # 源代码目录
│   ├── components/               # 组件目录
│   │   ├── blocks/              # 复合组件块
│   │   │   ├── header/          # 头部组件
│   │   │   │   └── simple-center.tsx # 居中简单头部
│   │   │   └── hero/            # 英雄区块组件
│   │   └── common/              # 通用组件
│   │       ├── locale-link.tsx  # 国际化链接
│   │       ├── locale-switcher.tsx # 语言切换器
│   │       ├── logo.tsx         # 品牌标志
│   │       └── page-container.tsx # 页面容器
│   ├── kit/                     # 基础组件工具包
│   │   └── shadcn/              # shadcn/ui 组件
│   │       ├── button.tsx       # 按钮组件
│   │       ├── dialog.tsx       # 对话框组件
│   │       ├── navigation-menu.tsx # 导航菜单
│   │       └── select.tsx       # 选择框组件
│   ├── lib/                     # 工具库
│   │   └── utils.ts            # 样式工具函数
│   ├── types/                   # 类型定义
│   │   └── index.d.ts          # 全局类型声明
│   └── globals.css             # 全局样式
├── components.json             # shadcn/ui 配置
├── package.json               # 项目依赖和脚本
└── tsconfig.json             # TypeScript 配置
```

## 🚀 使用指南

### package.json 命令详解

**`pnpm build`**

- **作用**：编译 TypeScript 代码
- **实际执行**：`tsc`
- **输出**：生成 JavaScript 文件和类型声明文件
- **用途**：构建发布版本或验证类型正确性

**`pnpm check-types`**

- **作用**：TypeScript 类型检查
- **实际执行**：`tsc --noEmit`
- **功能**：验证所有组件的类型定义正确性

**`pnpm lint`**

- **作用**：ESLint 代码质量检查
- **检查内容**：React 组件最佳实践、钩子规则、代码规范

**`pnpm format`**

- **作用**：Prettier 代码格式化
- **格式化范围**：TypeScript、TSX、Markdown 文件

### 在项目中使用组件

#### 1. 基础组件使用

```tsx
import { Button } from "@repo/ui/kit/shadcn/button";
import { Dialog } from "@repo/ui/kit/shadcn/dialog";

export default function MyPage() {
  return (
    <div>
      <Button variant="default" size="lg">
        主要按钮
      </Button>

      <Button variant="outline" size="sm">
        次要按钮
      </Button>

      <Button variant="ghost" disabled>
        禁用按钮
      </Button>
    </div>
  );
}
```

#### 2. 复合组件使用

```tsx
import { Header } from "@repo/ui/components/blocks/header/simple-center";
import { PageContainer } from "@repo/ui/components/common/page-container";
import { Logo } from "@repo/ui/components/common/logo";

export default function Layout() {
  return (
    <>
      <Header>
        <Logo />
        {/* 导航内容 */}
      </Header>

      <PageContainer>{/* 页面内容 */}</PageContainer>
    </>
  );
}
```

#### 3. 国际化组件使用

```tsx
import { LocaleSwitcher } from "@repo/ui/components/common/locale-switcher";
import { LocaleLink } from "@repo/ui/components/common/locale-link";

export default function Navigation() {
  return (
    <nav>
      <LocaleLink to="/">首页</LocaleLink>
      <LocaleLink to="/about">关于</LocaleLink>

      <LocaleSwitcher />
    </nav>
  );
}
```

#### 4. 导入样式

```tsx
// 在你的根组件或 CSS 文件中导入全局样式
import "@repo/ui/style.css";
```

## 🎨 组件详解

### Kit 组件 (shadcn/ui)

这些是基于 shadcn/ui 的基础组件，提供了标准的 UI 元素：

#### Button 按钮组件

```tsx
import { Button } from '@repo/ui/kit/shadcn/button';

// 不同变体
<Button variant="default">默认按钮</Button>
<Button variant="destructive">危险按钮</Button>
<Button variant="outline">轮廓按钮</Button>
<Button variant="secondary">次要按钮</Button>
<Button variant="ghost">幽灵按钮</Button>
<Button variant="link">链接按钮</Button>

// 不同尺寸
<Button size="default">默认大小</Button>
<Button size="sm">小尺寸</Button>
<Button size="lg">大尺寸</Button>
<Button size="icon">图标按钮</Button>

// 状态
<Button disabled>禁用状态</Button>
<Button loading>加载状态</Button>
```

#### Dialog 对话框组件

```tsx
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@repo/ui/kit/shadcn/dialog";

<Dialog>
  <DialogTrigger asChild>
    <Button>打开对话框</Button>
  </DialogTrigger>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>对话框标题</DialogTitle>
    </DialogHeader>
    <p>对话框内容</p>
  </DialogContent>
</Dialog>;
```

#### Select 选择框组件

```tsx
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@repo/ui/kit/shadcn/select";

<Select>
  <SelectTrigger className="w-[180px]">
    <SelectValue placeholder="请选择" />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="option1">选项1</SelectItem>
    <SelectItem value="option2">选项2</SelectItem>
    <SelectItem value="option3">选项3</SelectItem>
  </SelectContent>
</Select>;
```

#### NavigationMenu 导航菜单

```tsx
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuTrigger,
} from "@repo/ui/kit/shadcn/navigation-menu";

<NavigationMenu>
  <NavigationMenuItem>
    <NavigationMenuTrigger>产品</NavigationMenuTrigger>
    <NavigationMenuContent>
      <div className="grid gap-3 p-6 md:w-[400px]">{/* 菜单项 */}</div>
    </NavigationMenuContent>
  </NavigationMenuItem>
</NavigationMenu>;
```

### Common 组件 (通用组件)

#### LocaleSwitcher 语言切换器

```tsx
import { LocaleSwitcher } from '@repo/ui/components/common/locale-switcher';

// 基本使用
<LocaleSwitcher />

// 自定义样式
<LocaleSwitcher className="ml-4" />
```

**功能特点**：

- 自动检测当前语言
- 支持中文/英文切换
- 保持当前页面路径
- 响应式设计

#### LocaleLink 国际化链接

```tsx
import { LocaleLink } from '@repo/ui/components/common/locale-link';

// 基本链接
<LocaleLink to="/about">关于我们</LocaleLink>

// 带样式的链接
<LocaleLink to="/contact" className="text-blue-600 hover:text-blue-800">
  联系我们
</LocaleLink>

// 外部链接
<LocaleLink to="/docs" external>
  文档
</LocaleLink>
```

**功能特点**：

- 自动处理语言路径前缀
- 支持内部和外部链接
- 继承 React Router Link 的所有功能
- 类型安全的路径验证

#### Logo 品牌标志

```tsx
import { Logo } from '@repo/ui/components/common/logo';

// 基本使用
<Logo />

// 自定义尺寸
<Logo size="lg" />
<Logo size="sm" />

// 只显示图标
<Logo iconOnly />

// 自定义类名
<Logo className="text-white" />
```

**功能特点**：

- 响应式设计
- 支持深色/浅色主题
- 可配置的尺寸选项
- 支持仅图标模式

#### PageContainer 页面容器

```tsx
import { PageContainer } from '@repo/ui/components/common/page-container';

// 基本容器
<PageContainer>
  <h1>页面内容</h1>
  <p>这里是页面的主要内容</p>
</PageContainer>

// 全宽容器
<PageContainer fullWidth>
  <div>全宽内容</div>
</PageContainer>

// 自定义内边距
<PageContainer className="py-12">
  <div>自定义内边距</div>
</PageContainer>
```

**功能特点**：

- 响应式最大宽度
- 统一的内边距
- 居中对齐
- 支持全宽模式

### Blocks 组件 (复合组件块)

#### Header 头部组件

```tsx
import { Header } from "@repo/ui/components/blocks/header/simple-center";

<Header>
  <div className="flex items-center justify-between">
    <Logo />
    <nav className="hidden md:flex space-x-6">
      <LocaleLink to="/">首页</LocaleLink>
      <LocaleLink to="/about">关于</LocaleLink>
    </nav>
    <LocaleSwitcher />
  </div>
</Header>;
```

**功能特点**：

- 居中布局设计
- 响应式适配
- 支持自定义内容
- 统一的样式规范

## 🔧 开发指南

### 添加新组件

#### 1. 添加基础组件 (Kit)

```bash
# 创建新的 shadcn/ui 组件
touch src/kit/shadcn/card.tsx
```

组件结构：

```tsx
import * as React from "react";
import { cn } from "@repo/ui/lib/utils";

const Card = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "rounded-lg border bg-card text-card-foreground shadow-sm",
      className,
    )}
    {...props}
  />
));
Card.displayName = "Card";

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5 p-6", className)}
    {...props}
  />
));
CardHeader.displayName = "CardHeader";

export { Card, CardHeader };
```

#### 2. 添加通用组件 (Common)

```bash
# 创建新的通用组件
touch src/components/common/breadcrumb.tsx
```

组件示例：

```tsx
import { ChevronRightIcon, HomeIcon } from "@heroicons/react/24/outline";
import { LocaleLink } from "./locale-link";
import { cn } from "@repo/ui/lib/utils";

interface BreadcrumbItem {
  label: string;
  href?: string;
  current?: boolean;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  className?: string;
}

export function Breadcrumb({ items, className }: BreadcrumbProps) {
  return (
    <nav className={cn("flex", className)} aria-label="面包屑导航">
      <ol className="flex items-center space-x-2">
        <li>
          <LocaleLink to="/" className="text-gray-400 hover:text-gray-500">
            <HomeIcon className="h-5 w-5" />
          </LocaleLink>
        </li>

        {items.map((item, index) => (
          <li key={index} className="flex items-center">
            <ChevronRightIcon className="h-5 w-5 text-gray-300 mx-2" />

            {item.href && !item.current ? (
              <LocaleLink
                to={item.href}
                className="text-gray-500 hover:text-gray-700"
              >
                {item.label}
              </LocaleLink>
            ) : (
              <span
                className={cn("text-gray-900", item.current && "font-medium")}
              >
                {item.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
```

#### 3. 添加复合组件 (Blocks)

```bash
# 创建新的复合组件
mkdir -p src/components/blocks/hero
touch src/components/blocks/hero/simple.tsx
```

复合组件示例：

```tsx
import { Button } from "@repo/ui/kit/shadcn/button";
import { PageContainer } from "@repo/ui/components/common/page-container";

interface HeroSimpleProps {
  title: string;
  description: string;
  primaryAction?: {
    label: string;
    href: string;
  };
  secondaryAction?: {
    label: string;
    href: string;
  };
  className?: string;
}

export function HeroSimple({
  title,
  description,
  primaryAction,
  secondaryAction,
  className,
}: HeroSimpleProps) {
  return (
    <section className={cn("py-16 md:py-24", className)}>
      <PageContainer>
        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
            {title}
          </h1>
          <p className="mt-6 text-lg leading-8 text-gray-600 max-w-2xl mx-auto">
            {description}
          </p>

          {(primaryAction || secondaryAction) && (
            <div className="mt-10 flex items-center justify-center gap-x-6">
              {primaryAction && (
                <Button asChild size="lg">
                  <LocaleLink to={primaryAction.href}>
                    {primaryAction.label}
                  </LocaleLink>
                </Button>
              )}

              {secondaryAction && (
                <Button variant="outline" asChild size="lg">
                  <LocaleLink to={secondaryAction.href}>
                    {secondaryAction.label}
                  </LocaleLink>
                </Button>
              )}
            </div>
          )}
        </div>
      </PageContainer>
    </section>
  );
}
```

### 更新导出配置

添加新组件后，需要更新 `package.json` 的 exports 字段：

```json
{
  "exports": {
    "./kit/shadcn/card": "./src/kit/shadcn/card.tsx",
    "./components/common/breadcrumb": "./src/components/common/breadcrumb.tsx",
    "./components/blocks/hero/simple": "./src/components/blocks/hero/simple.tsx"
  }
}
```

## 🎨 样式定制

### 主题配置

组件库使用 Tailwind CSS 4 和 CSS 变量进行主题配置：

```css
/* src/globals.css */
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 222.2 84% 4.9%;
    --primary: 222.2 47.4% 11.2%;
    --primary-foreground: 210 40% 98%;
    --secondary: 210 40% 96%;
    --secondary-foreground: 222.2 84% 4.9%;
    /* 更多颜色变量 */
  }

  .dark {
    --background: 222.2 84% 4.9%;
    --foreground: 210 40% 98%;
    /* 深色主题变量 */
  }
}
```

### 自定义组件样式

```tsx
import { Button } from "@repo/ui/kit/shadcn/button";
import { cn } from "@repo/ui/lib/utils";

// 使用 cn 函数合并样式
<Button
  className={cn(
    "bg-gradient-to-r from-blue-500 to-purple-600",
    "hover:from-blue-600 hover:to-purple-700",
    "text-white font-semibold",
  )}
>
  渐变按钮
</Button>;
```

### 工具函数

```typescript
// src/lib/utils.ts
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

// 样式类名合并工具
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// 条件样式应用
export function conditionalStyles(
  condition: boolean,
  trueStyles: string,
  falseStyles?: string,
) {
  return condition ? trueStyles : falseStyles || "";
}
```

## 🌍 国际化集成

组件库已内置 i18next 支持：

```tsx
import { useTranslation } from "react-i18next";
import { Button } from "@repo/ui/kit/shadcn/button";

export function SaveButton() {
  const { t } = useTranslation();

  return <Button>{t("common.save")}</Button>;
}
```

## ❓ 常见问题

### 1. 组件导入失败？

确保组件已在 `package.json` 的 exports 字段中正确配置：

```bash
# 检查导出配置
cat packages/ui/package.json | grep -A 10 "exports"
```

### 2. 样式不生效？

确保已正确导入全局样式：

```tsx
// 在应用根目录导入
import "@repo/ui/style.css";
```

### 3. TypeScript 类型错误？

重新构建组件库的类型定义：

```bash
cd packages/ui
pnpm build
```

### 4. 新组件不显示？

检查组件是否正确导出和导入：

```tsx
// 检查组件导出
export { MyNewComponent } from "./my-new-component";

// 检查组件导入
import { MyNewComponent } from "@repo/ui/components/common/my-new-component";
```

## 📚 学习资源

- [shadcn/ui 官方文档](https://ui.shadcn.com/)
- [Radix UI 文档](https://www.radix-ui.com/)
- [Tailwind CSS 4 文档](https://tailwindcss.com/)
- [React ARIA 无障碍指南](https://react-spectrum.adobe.com/react-aria/)
- [Headless UI 文档](https://headlessui.com/)

## 🔗 相关链接

- [前端应用文档](../../apps/web/README.md)
- [后端 API 文档](../../apps/service/README.md)
- [类型定义包](../types/README.md)
- [项目根目录](../../README.md)
