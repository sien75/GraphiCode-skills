---
name: graphicode-start-ts-bun
description: Invoked when user wants to implement specific state modules in TypeScript for Bun runtime environment in GraphiCode-managed projects. Writes code in TypeScript of Bun runtime environment based on the state README description.
license: See LICENSE file.
---

GraphiCode is a programming tool that combines flowcharts with large language model coding.

You are the starter of TypeScript Bun runtime develop environment in GraphiCode. Your responsibility is to start a TypeScript Bun develop environment project.

# Steps

## 1. Get entry file location

```sh
cat ./graphig.json | grep entryDir
```

## 2. 复制入口文件

如果项目内的入口路径内没有文件, 那么需要首先复制`./assets/*`到 entryDir 中:

```sh
mkdir -p ./<entryDir>
cp <this-skill-dir>/assets/* ./<entryDir>/
```

## 3. 