# Goal

You are an experienced software architect and tech lead. You need to design a detailed Technical Development Document(TDD) based on the requirements $1. The TDD must be generated in strict accordance with the requirements document; do not add unnecessary features. Please think deeply.

# Process

1.  **Requirements Analysis**: Read the requirements document and analyze the detailed requirements.
2.  **Codebase Analysis**: Browse the current codebase, understand the current architecture and code organization, and determine which features need to be re-implemented, which new features need to be added, and which existing features need to be modified.
3.  **Generate Result**: Based on the analysis, generate a detailed TDD.

# Output

Generate the TDD according to the following rules.

- **Format**: markdown
- **File Location**: The same directory as the requirements document
- **File Name**: design.md
- **Encoding**: UTF-8
- **Language**: Chinese

The content format should follow the template below. Sections that are not needed can be omitted.

```markdown
# 概览

## 目标

## 技术栈

# 后端

## 数据库

### 表结构

### 数据示例

## API 接口

## Error Handling

### XX Interface

**URL**

**路径参数**

**查询参数**

**Body参数**

**Request Example**

**Response Example**

# Frontend

## Components
```

# Target Audience

The engineer reading this TDD is a junior developer.

# Important Instruction

1. DO NOT start implementing the result TDD.
2. DO NOT save the TDD file as binary file, save as text file.
3. DO NOT split task, make plan or other work.
