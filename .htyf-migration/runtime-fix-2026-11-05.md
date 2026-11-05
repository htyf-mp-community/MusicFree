# 0.0.66：修复启动时 runAfterInteractions 崩溃

用户在 iOS 宿主启动 `plugin_music` 时遇到：

```text
TypeError: Cannot read property 'runAfterInteractions' of undefined
```

## 根因与复现

当前 RN 0.88.1 已移除 `InteractionManager`，生产环境不再导出这个对象。
目标业务仍有五处直接调用：歌单持久化、插件列表排序、下载队列、播放器的循环模式
按钮和播放列表的循环模式按钮。启动时的歌单初始化会进入 `storage.setSheets`。

回归用例通过真实的 `storage.setSheets` 入口，在不导出 InteractionManager 的 RN
环境中调用歌单写入，首次运行复现了与截图一致的 TypeError：

```sh
node node_modules/jest/bin/jest.js --runInBand --watchman=false __tests__/musicSheetStorage.test.ts
```

同一个用例在修复后通过，确认歌单确实写入，且返回的 Promise 在写入后完成。

## 修复

- 使用 `src/utils/runWhenIdle.ts` 统一延后任务：优先使用 `requestIdleCallback`，
  传入 100ms 超时参数；宿主未提供该 API 时用 `setTimeout` 让出当前事件循环。
- 替换五处旧调用，保留异步任务完成和异常传播，歌单初始化仍可等待写入完成。
- 新增调度回归，覆盖缺少 idle API、提供 idle API、异步任务完成及异常传播。
- 将修复包版本从 0.0.65 提升至 0.0.66，便于宿主更新到修复后的资源而非复用旧包。

React Native 官方建议迁移到
[requestIdleCallback](https://reactnative.dev/docs/global-requestIdleCallback)；
该 API 不提供旧交互句柄的动画完成屏障，本项目使用它来延后上述后台任务。

## 验证

- 五个测试套件、22 项测试通过，包含曾经失败的真实歌单写入入口。
- 新工具函数和两个新测试文件 ESLint：0 错误、0 警告。
- 目标业务和当前依赖中已无 `runAfterInteractions` 调用。
- iOS 和 Android 均编译通过，各有一个原有 Reanimated 动态 require 警告。
- 解压校验双端包 CRC，并检查实际 JS bundle，均已没有 `runAfterInteractions` 引用。
- iOS 包：1,709,331 字节；bundle：8,349,014 字节。
- Android 包：1,710,133 字节；bundle：8,354,760 字节。
- 双端产物分别留在 `build/verification/ios/` 和 `build/verification/android/`。
  当前 `dist/` 恢复为用户截图对应的 iOS 0.0.66 输出。
- 全量 TypeScript 仍有 133 个既存业务诊断，新工具函数和测试没有类型错误；全量
  ESLint 仍为 84 个业务错误、3727 个警告。
- 分享二维码已同步为 `plugin_music@0.0.66`，需上传 `dist/app.json` 和
  `dist/dist.dgz` 至项目配置的对应地址后加载新版。
- 尚未在用户手机上重新运行；部署 0.0.66 的配置及资源包后，需重新加载新版验证。
