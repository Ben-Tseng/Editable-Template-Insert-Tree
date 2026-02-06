# Option Name 功能修改说明

## 修改内容

实现了 Option 名称可编辑功能，使得右键菜单中显示的是 Option 的名称而不是文本内容。

## 修改的文件

### 1. options.js
- 修改 `ttCreateNewTemplate()` 函数：为每个 option 添加 `name` 字段，默认值为 "Option 1", "Option 2", 等
- 修改 `createOptionItem()` 函数：
  - 添加了 `optNameInput` 输入框用于编辑 option 名称
  - 修改标签文本为 "Option Name:"
  - 更新 `optInputs` 数组结构为对象 `{ nameInput, textArea }`
  - 删除按钮同时清空名称和文本
- 修改保存逻辑：同时保存 option 的 `name` 和 `text` 字段

### 2. popup.js
- 修改 `ttCreateNewTemplate()` 函数：为每个 option 添加 `name` 字段
- 修改 `createOptionItem()` 函数：
  - 添加了 `optNameInput` 输入框
  - 修改标签文本为 "Option Name:"
  - 更新 `optionInputs` 数组结构为对象 `{ nameInput, textArea }`
- 修改保存逻辑：同时保存 option 的 `name` 和 `text` 字段

### 3. background.js
- 已经支持使用 `opt.name` 字段显示菜单项
- 如果 `name` 不存在或为空，则回退到显示 "Option N"

## 使用方式

1. 点击 "Add Template" 添加新模板
2. 点击 "Edit" 进入编辑界面
3. 在 "Optional Lines (Sub-Templates)" 部分，每个 Option 现在有两个输入框：
   - 第一个输入框：Option Name（显示在右键菜单中的名称）
   - 第二个输入框：Option 的实际文本内容
4. 保存后，右键菜单中会显示您设置的 Option 名称

## 默认行为

- 新创建的模板默认有 3 个 Option，名称分别为 "Option 1", "Option 2", "Option 3"
- 可以通过 "+ Add Option" 按钮添加更多 Option（最多 10 个）
- 如果 Option 名称为空，菜单中会显示 "Option N"（N 为序号）
