# HTYF 官方模板更新（2026-11-03）

源项目：`/Users/dgz/code/github/MusicFree`；默认更新目标：
`/Users/dgz/code/github/MusicFree/HTYF`，应用类型为直接 React Native 应用。
官方来源：[htyf-cli main@8c6fc84](https://github.com/htyf-mp-community/htyf-cli/commit/8c6fc84077470bee05af97d6cf04682a0977c210)，
模板目录为 `packages/cli/_apps_temp_`。已通过 `git ls-remote` 核对远端 HEAD，
使用同一提交、工作区干净的本地官方仓库进行合并，没有重新初始化目标。

## 版本与配置

| 组件 | 更新前 | 更新后 |
| --- | --- | --- |
| HTYF CLI | 0.6.0 | 0.7.14 |
| HTYF JS SDK | 0.2.25 | 0.2.28 |
| React Native | 0.86.3 | 0.88.1 |
| React / React Test Renderer | 19.2.3 | 19.3.1 |
| Expo | 57.0.26 | 58.0.22 |
| Jest | 29.7.0 | 30.5.1 |
| ESLint | 8.57.1 | 10.9.1 |
| Node.js 最低版本 | 20 | 22.13.0 |

- 对齐已有依赖与模板版本，并运行官方 CLI 的 `sync-deps --non-interactive --project …/MusicFree/HTYF` 对齐宿主共享模块。
- 同步官方 `webpack.config.mjs`：通过 `require.resolve` 定位共享配置，并采用宿主声明的共享模块版本。
- 保留项目的 `@react-native/jest-preset` 配置，随 RN 更新到 0.88.1；没有照搬模板的旧 `react-native` preset。
- 将旧 `.eslintrc.js` 替换为 ESLint 10 的 flat config，沿用官方 RN 规则；使用官方 `@eslint/compat@2.1.1` 恢复旧插件 API，并使用 `@typescript-eslint/parser@8.72.1` 解析本项目 JS，避开 RN 配置中 Babel parser 不支持的新 scope API。
- 更新 Expo 自动链接工具到 58.0.16；不安装未使用的模板演示依赖，也不引入 AsyncStorage。
- 保留 MusicFree 业务逻辑、单元测试、应用入口、MMKV 命名空间、补丁、应用 ID、0.0.64 版本和发布地址。
- 旧 `@d11/react-native-fast-image` 已被新宿主拒绝，替换为共享清单提供的 `react-native-fast-image@10.10.2`；只调整 `fileUtils.ts`、`base/fastImage.tsx` 和 `base/listItem.tsx` 中的三个导入路径。
- 补齐 CLI 子进程需要的 `cross-env@10.1.0`，避免首次打包临时下载和询问。
- 官方模板文件 SHA-256、完整依赖差异和保留项见 [template-state.json](template-state.json)。

## 必要的构建兼容修正

模板两个 Re.Pack 插件 5.4.2 均声明 core peer `^5.4.2`，但模板和宿主共享清单
仍固定 Re.Pack 5.4.0。实际构建出现 Babel 插件子路径不存在和 RN 新入口无法解析。
本项目因此使用构建工具 `@callstack/repack@5.4.2`，启用 package exports；运行时
共享版本仍从宿主清单读取。后续执行 `htyf sync-deps` 会将此本地构建工具降回
5.4.0，官方修正前需保留这里的构建版本覆盖。

启用 exports 后，Cheerio 会优先进入 Node 实现并引入 undici 和 Node 内建模块。
现已显式选择它原本的 `browser` 入口，保持此前移动端解析行为。

CLI/Re.Pack 会在编译错误后仍返回 0 并压缩空输出。本项目通过 compiler 的
`done` / `failed` hook 设置失败退出码，阻止这种无效发布包；验收也检查实际日志和
压缩包内容，不单凭 CLI 的成功文案。

## 验证

- 依赖安装成功，`postinstall` 的圆形进度条补丁应用成功。
- `yarn check --integrity`：通过，依赖目录与锁文件一致。
- `yarn test --runInBand --watchman=false`：3 个测试套件、17 项测试全部通过。
- `node node_modules/eslint/bin/eslint.js eslint.config.js webpack.config.mjs`：通过，无警告。
- 全量 `yarn lint`：未通过，业务代码有 84 个错误、3727 个警告；检查工具可正常执行，已不再因插件 API 或 parser 崩溃。
- `yarn tsc --noEmit`：未通过，138 个诊断，涉及 React JSX/refs、FlashList 和现有业务类型/声明等。未扩大本次模板更新去重写业务实现。
- 使用真实 Webpack 编译一个不存在的入口，确认错误 hook 返回编译错误并设置失败退出码。
- iOS HTYF 构建通过：日志为 `compiled with 1 warning`，资源包 1,709,236 字节，包含 8,348,459 字节的 JS bundle；并非先前失败时仅含元数据的空包。
- iOS 构建留档：`build/verification/ios/dist.dgz`，配套配置和 manifest 位于同目录。
- Android HTYF 构建通过：日志为 `compiled with 1 warning`，资源包 1,710,025 字节，包含 8,354,205 字节的 JS bundle。
- Android 构建留档：`build/verification/android/dist.dgz`，配套配置和 manifest 位于同目录。当前 `dist/` 是最后构建的 Android 输出；重新运行 iOS 命令可生成 iOS 输出。
- 双端的单个编译警告均来自 Reanimated 的 `jestUtils` 动态 require；尚未完成宿主真机运行验证。
- 对比更新开始时的文件 SHA-256，源项目保留不变。目标业务源码只更换三处 FastImage 导入，其余实现、测试和原生工程保留。

## 分享与发布

- 已更新 [readme.md](../readme.md) 开头的中英使用说明和分享入口。
- 分享二维码保存在 [docs/assets/htyf-share-qr.png](../docs/assets/htyf-share-qr.png)，
  已实际解码，确认与 README 分享链接一致，应用 ID 为 `plugin_music`。
- 公开配置和资源包地址均返回 HTTP 200；线上配置为 MusicFree / plugin_music / 0.0.64。
- 本次更新不上传或发布资源包。新包部署、App 扫码添加和运行验收待完成。

## 范围与待办

本次只同步官方应用模板，不宣称原有功能迁移清单已经完成，也不推进
`source-state.json` 的功能迁移基线。原有业务静态检查和真机验收缺口仍以
[migration-checklist.md](migration-checklist.md) 为准。

`ios/` 和 `android/` 保留原样。它们与最新模板仍有 7 个文件不同，涉及 Android
MainApplication/Gradle 与 iOS Podfile/lock、Xcode 工程、AppDelegate 和隐私清单。
HTYF 小程序运行依赖配套 RN 0.88.1 宿主；独立原生 App 的升级与编译需另行验证。
