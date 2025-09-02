# Husky Git 钩子配置

本目录包含了项目的 Git 钩子配置，使用 [Husky](https://typicode.github.io/husky/) 来管理和执行这些钩子。

## 🤔 什么是 Husky？

Husky 是一个用于管理 Git 钩子的工具，它让你可以轻松地在 Git 操作（如提交、推送）时自动运行脚本。这对于维护代码质量和统一开发流程非常有用。

### Git 钩子是什么？

Git 钩子（Git Hooks）是 Git 在特定事件发生时自动执行的脚本。比如：

- 在提交代码前运行代码检查
- 在提交信息写入前验证格式
- 在推送代码前运行测试

## 🎯 为什么需要 Husky？

### 传统方式的问题

- Git 原生钩子配置复杂，不易分享
- 新成员加入项目时需要手动配置钩子
- 钩子脚本不会被 Git 跟踪，容易丢失

### Husky 的优势

- **简单易用**：通过简单的配置文件管理钩子
- **团队共享**：钩子配置跟随项目一起版本控制
- **自动安装**：新成员克隆项目后自动配置钩子
- **跨平台**：在 Windows、macOS、Linux 上都能正常工作

## 📋 项目中的钩子配置

### 1. `commit-msg` - 提交信息规范检查

**文件位置**：`.husky/commit-msg`

**作用**：验证提交信息是否符合约定式提交（Conventional Commits）规范

**执行内容**：

```bash
pnpx commitlint --edit $1
```

**检查规则**：

- `feat: 添加新功能` ✅ 正确格式
- `fix: 修复登录问题` ✅ 正确格式
- `随便写的提交信息` ❌ 错误格式
- `Add new feature` ❌ 错误格式（应该用中文或规范前缀）

**如果检查失败**：

```bash
# 提交会被阻止，显示类似错误信息
⧗   input: 随便写的提交信息
✖   subject may not be empty [subject-empty]
✖   type may not be empty [type-empty]
```

### 2. `pre-commit` - 提交前代码检查

**文件位置**：`.husky/pre-commit`

**作用**：在代码提交前自动运行代码质量检查和格式化

**执行逻辑**：

```bash
# 检查各个目录是否有变更的文件，如果有则运行相应的 lint-staged

ROOT_DIR="$(pwd)"

# 前端项目检查
if git diff --cached --name-only | grep -q "^apps/web/"; then
  cd "$ROOT_DIR/apps/web" && pnpx lint-staged
fi

# 后端项目检查
if git diff --cached --name-only | grep -q "^apps/service/"; then
  cd "$ROOT_DIR/apps/service" && pnpx lint-staged
fi

# UI 组件库检查
if git diff --cached --name-only | grep -q "^packages/ui/"; then
  cd "$ROOT_DIR/packages/ui" && pnpx lint-staged
fi

# 其他包的检查...
```

**检查内容**：

- ESLint 代码质量检查
- Prettier 代码格式化
- TypeScript 类型检查（如果配置了）

**如果检查失败**：

```bash
# 提交会被阻止，显示错误信息
✖ eslint --fix:
apps/web/app/routes/home.tsx
  12:5  error  'console' is not defined  no-undef

✖ lint-staged failed
```

## 🔧 工作原理详解

### 1. 安装过程

当你运行 `pnpm install` 时，会自动执行 `pnpm prepare`，这个命令会：

```bash
# 初始化 Husky，在 .git/hooks/ 目录下创建实际的钩子文件
husky
```

### 2. 钩子执行流程

#### commit-msg 钩子流程：

```
你执行 git commit -m "消息"
    ↓
Git 准备创建提交
    ↓
触发 commit-msg 钩子
    ↓
运行 pnpx commitlint --edit $1
    ↓
验证提交信息格式
    ↓
通过 → 继续提交
失败 → 阻止提交并显示错误
```

#### pre-commit 钩子流程：

```
你执行 git commit
    ↓
Git 检测到暂存区有文件
    ↓
触发 pre-commit 钩子
    ↓
检查哪些项目有变更的文件
    ↓
对应项目运行 lint-staged
    ↓
执行 ESLint + Prettier
    ↓
通过 → 继续提交
失败 → 阻止提交并显示错误
```

### 3. lint-staged 的作用

`lint-staged` 是一个工具，它只对 Git 暂存区（staged）的文件运行检查，而不是整个项目。这样可以：

- 加快检查速度
- 只检查你修改的文件
- 避免因其他人的代码问题而阻止你的提交

## 🛠 如何使用

### 正常开发流程

```bash
# 1. 修改代码
vim apps/web/app/routes/home.tsx

# 2. 暂存文件
git add apps/web/app/routes/home.tsx

# 3. 提交（会自动触发钩子检查）
git commit -m "feat: 添加首页新功能"

# 如果检查通过，提交成功
# 如果检查失败，修复问题后重新提交
```

### 处理检查失败的情况

**ESLint 错误**：

```bash
# 如果是可自动修复的问题，钩子会自动修复并重新暂存
# 如果是需要手动修复的问题，你需要：
1. 查看错误信息，定位问题文件
2. 修复代码问题
3. 重新暂存文件：git add <文件名>
4. 重新提交：git commit -m "your message"
```

**提交信息格式错误**：

```bash
# 如果提交信息格式不正确：
1. 查看错误提示
2. 使用正确格式重新提交：
   git commit -m "feat: 正确的提交信息"
```

## 🔧 自定义配置

### 添加新的 Git 钩子

如果你需要添加新的钩子，可以：

```bash
# 创建新的钩子文件
npx husky add .husky/pre-push "npm test"

# 这会创建 .husky/pre-push 文件，内容为：
# #!/usr/bin/env sh
# . "$(dirname -- "$0")/_/husky.sh"
# npm test
```

### 修改现有钩子

直接编辑 `.husky/` 目录下的文件：

```bash
# 编辑 pre-commit 钩子
vim .husky/pre-commit

# 编辑 commit-msg 钩子
vim .husky/commit-msg
```

### 跳过钩子检查（不推荐）

在紧急情况下，你可以跳过钩子检查：

```bash
# 跳过 pre-commit 钩子
git commit -m "feat: 紧急修复" --no-verify

# 或者使用环境变量
HUSKY=0 git commit -m "feat: 紧急修复"
```

⚠️ **注意**：跳过钩子检查会绕过代码质量保证，应该谨慎使用。

## ❓ 常见问题

### 1. Husky 钩子没有执行？

**可能原因和解决方案**：

```bash
# 1. 确认 Husky 已正确安装
pnpm run prepare

# 2. 检查 .git/hooks/ 目录下是否有钩子文件
ls -la .git/hooks/

# 3. 确认钩子文件有执行权限
chmod +x .git/hooks/*
```

### 2. 钩子执行很慢？

**优化建议**：

- lint-staged 只检查暂存文件，确保配置正确
- 考虑调整 ESLint 规则，移除耗时的检查
- 使用更快的工具替代（如用 swc 替代 babel）

### 3. 新成员的电脑上钩子不工作？

**解决步骤**：

```bash
# 新成员需要执行
pnpm install
pnpm run prepare

# 如果还是不行，手动重新安装 Husky
rm -rf .git/hooks/
pnpm run prepare
```

### 4. 想要禁用某个钩子？

```bash
# 临时禁用（重新安装会恢复）
rm .git/hooks/pre-commit

# 永久禁用（删除配置文件）
rm .husky/pre-commit
```

## 📚 相关资料

- [Husky 官方文档](https://typicode.github.io/husky/)
- [Conventional Commits 规范](https://www.conventionalcommits.org/)
- [lint-staged 文档](https://github.com/okonet/lint-staged)
- [commitlint 配置指南](https://commitlint.js.org/)
