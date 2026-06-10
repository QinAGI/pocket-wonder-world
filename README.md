# 口袋奇妙世界

面向中小学生两周 Vibe Coding 课程的 Expo 原型。学生可以选择世界主题、布置场景、设计互动，并生成自己的世界邀请卡。

## 运行

```powershell
npm.cmd start
```

手机安装 Expo Go 后扫描终端二维码，或运行：

```powershell
npm.cmd run web
```

## 在线体验

GitHub Pages: https://qinagi.github.io/pocket-wonder-world/

## 适合学生修改的内容

- 在 `THEMES` 中增加新的世界主题
- 修改角色、建筑和场景物品
- 给按钮设计新的互动规则
- 更换配色、名称和邀请卡文案

## 当前功能

- 六种可切换的世界风格
- 昼夜切换、彩色雨、角色跳舞
- 自定义世界名称和场景元素
- 自动生成个性化邀请卡
- iOS、Android 和 Web 共用一套代码

## 发布前

`app.json` 中的 `ios.bundleIdentifier` 和 `android.package` 是示例值。正式发布时应改为机构实际拥有的唯一标识。
