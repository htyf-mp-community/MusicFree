import path from 'path';
import TerserPlugin from 'terser-webpack-plugin';
import * as Repack from '@callstack/repack';
import fse from 'fs-extra';
import crypto from 'crypto'
import webpack from 'webpack'

const webcrypto = crypto.webcrypto;
const pkg = fse.readJsonSync('./package.json')
const uuid = webcrypto.randomUUID();

const dependencies = {}

const sharedObj = {}
for (const key in dependencies) {
  const p = dependencies[key]
  sharedObj[key] = {
    /** 是否运行为单例 */
    singleton: true,
    /** 是否不拆包 === host 必须为true */
    eager: true,
    requiredVersion: p.replace(/\^/gi, '')
  }
}
// delete sharedObj['@hongtangyun/react-native-mini-apps-engines']

/**
 * More documentation, installation, usage, motivation and differences with Metro is available at:
 * https://github.com/callstack/repack/blob/main/README.md
 *
 * The API documentation for the functions and plugins used in this file is available at:
 * https://re-pack.netlify.app/
 */

/**
 * Webpack configuration.
 * You can also export a static object or a function returning a Promise.
 *
 * @param env Environment options passed from either Webpack CLI or React Native CLI
 *            when running with `react-native start/bundle`.
 */
export default (env) => {
  console.error('env.mode: ', env.mode);
  const {
    mode = 'development',
    context = Repack.getDirname(import.meta.url),
    entry = './index.js',
    platform = process.env.PLATFORM,
    minimize = mode === 'production',
    devServer = undefined,
    bundleFilename = undefined,
    sourceMapFilename = undefined,
    assetsPath = undefined,
    reactNativePath = new URL('./node_modules/react-native', import.meta.url)
      .pathname,
  } = env;
  const dirname = Repack.getDirname(import.meta.url);

  if (!platform) {
    throw new Error('Missing platform');
  }

    /**
   * Using Module Federation might require disabling hmr.
   * Uncomment below to set `devServer.hmr` to `false`.
   *
   * Keep in mind that `devServer` object is not available
   * when running `webpack-bundle` command. Be sure
   * to check its value to avoid accessing undefined value,
   * otherwise an error might occur.
   */
  // if (devServer) {
  //   devServer.hmr = false;
  // }
  
  /**
   * Depending on your Babel configuration you might want to keep it.
   * If you don't use `env` in your Babel config, you can remove it.
   *
   * Keep in mind that if you remove it you should set `BABEL_ENV` or `NODE_ENV`
   * to `development` or `production`. Otherwise your production code might be compiled with
   * in development mode by Babel.
   */
  process.env.BABEL_ENV = mode;
  const _options = Repack.getResolveOptions(platform);
  _options.extensions.push('.react-native.js', '.react-native.ts', '.react-native.tsx')
  console.log(_options)
  return {
    target: "react-native",
    mode,
    /**
     * This should be always `false`, since the Source Map configuration is done
     * by `SourceMapDevToolPlugin`.
     */
    devtool: false,
    context,
    /**
     * `getInitializationEntries` will return necessary entries with setup and initialization code.
     * If you don't want to use Hot Module Replacement, set `hmr` option to `false`. By default,
     * HMR will be enabled in development mode.
     */
    entry: [
      ...Repack.getInitializationEntries(reactNativePath, {
        hmr: devServer && devServer.hmr,
      }),
      entry,
    ],
    resolve: {
      /**
       * `getResolveOptions` returns additional resolution configuration for React Native.
       * If it's removed, you won't be able to use `<file>.<platform>.<ext>` (eg: `file.ios.js`)
       * convention and some 3rd-party libraries that specify `react-native` field
       * in their `package.json` might not work correctly.
       */
      ..._options,
      alias: {
        axios$: path.join(dirname, './node_modules/axios/dist/browser/axios.cjs'),
        cheerio$: path.join(dirname, './node_modules/cheerio/lib/index.js'),
        realm$: path.join(dirname, './node_modules/realm/index.react-native.js'),
        "@realm/fetch": path.join(dirname, './node_modules/@realm/fetch/dist/react-native/react-native.js'),
        nanoid$: path.join(dirname, './node_modules/nanoid/index.browser.cjs'),
        "nanoid/non-secure$": path.join(dirname, './node_modules/nanoid/non-secure/index.cjs'),
        "expo-sqlite": path.join(dirname, './node_modules/expo-sqlite/build/index.js'),
        "use-immer$": path.join(dirname, './node_modules/use-immer/dist/use-immer.js'),
        "react-native-quick-crypto": path.join(dirname, './node_modules/react-native-quick-crypto/lib/commonjs'),
        "react-native-wgpu": path.join(dirname, './node_modules/react-native-wgpu/lib/commonjs'),
        "open-im-sdk-rn": path.join(dirname, './node_modules/open-im-sdk-rn/lib/commonjs'),
        // immer$: path.join(dirname, './node_modules/immer/dist/index.js'),
        // '@react-stately/combobox': path.join(dirname, './node_modules/@react-stately/combobox/src/index.ts'),
      },
    },
    /**
     * Configures output.
     * It's recommended to leave it as it is unless you know what you're doing.
     * By default Webpack will emit files into the directory specified under `path`. In order for the
     * React Native app use them when bundling the `.ipa`/`.apk`, they need to be copied over with
     * `Repack.OutputPlugin`, which is configured by default inside `Repack.RepackPlugin`.
     */
    output: {
      clean: true,
      hashFunction: 'xxhash64',
      path: path.join(dirname, 'build/generated', platform),
      filename: 'index.bundle',
      chunkFilename: '[name].chunk.bundle',
      publicPath: Repack.getPublicPath({ platform, devServer }),
    },
    /**
     * Configures optimization of the built bundle.
     */
    optimization: {
      /** Enables minification based on values passed from React Native CLI or from fallback. */
      minimize,
      /** Configure minimizer to process the bundle. */
      minimizer: [
        new TerserPlugin({
          test: /\.(js)?bundle(\?.*)?$/i,
          /**
           * Prevents emitting text file with comments, licenses etc.
           * If you want to gather in-file licenses, feel free to remove this line or configure it
           * differently.
           */
          extractComments: false,
          terserOptions: {
            format: {
              comments: false,
            },
          },
        }),
      ],
      chunkIds: 'named',
      // moduleIds: false,
    },
    module: {
      /**
       * This rule will process all React Native related dependencies with Babel.
       * If you have a 3rd-party dependency that you need to transpile, you can add it to the
       * `include` list.
       *
       * You can also enable persistent caching with `cacheDirectory` - please refer to:
       * https://github.com/babel/babel-loader#options
       */
      rules: [
        {
          test: /\.(js|jsx|ts|tsx|cjs|mjs)$/, 
          include: [
            /node_modules/,
          ],
          exclude: [
            /node_modules\/delay/,
          ],
          use: (info) => {
            // console.log()
            // console.log('====== rules =======')
            // console.log('****')
            // console.log(info.resource)
            // console.log('****')
            // console.log('====== rules =======')
            // console.log()
            return {
              loader: 'babel-loader',
              options: {
                  presets: [
                    ['module:@react-native/babel-preset', {}],
                  ],
                  plugins: [],
              },
            }
          }
        },
        /**
         * Here you can adjust loader that will process your files.
         *
         * You can also enable persistent caching with `cacheDirectory` - please refer to:
         * https://github.com/babel/babel-loader#options
         */
        {
          test: /\.[jt]sx?$/,
          exclude: /node_modules/,
          use: {
            loader: 'babel-loader',
            options: {
              /** Add React Refresh transform only when HMR is enabled. */
              plugins:
                devServer && devServer.hmr
                  ? ['module:react-refresh/babel']
                  : undefined,
            },
          },
        },
        /**
         * This loader handles all static assets (images, video, audio and others), so that you can
         * use (reference) them inside your application.
         *
         * If you wan to handle specific asset type manually, filter out the extension
         * from `ASSET_EXTENSIONS`, for example:
         * ```
         * Repack.ASSET_EXTENSIONS.filter((ext) => ext !== 'svg')
         * ```
         */
        {
          test: Repack.getAssetExtensionsRegExp(Repack.ASSET_EXTENSIONS),
          use: {
            loader: '@callstack/repack/assets-loader',
            options: {
              platform,
              devServerEnabled: Boolean(devServer),
              /**
               * Defines which assets are scalable - which assets can have
               * scale suffixes: `@1x`, `@2x` and so on.
               * By default all images are scalable.
               */
              scalableAssetExtensions: Repack.SCALABLE_ASSETS,
            },
          },
        },
      ],
    },
    plugins: [
      // new BundleAnalyzerPlugin(),
      /**
       * Configure other required and additional plugins to make the bundle
       * work in React Native and provide good development experience with
       * sensible defaults.
       *
       * `Repack.RepackPlugin` provides some degree of customization, but if you
       * need more control, you can replace `Repack.RepackPlugin` with plugins
       * from `Repack.plugins`.
       */
      new Repack.RepackPlugin({
        context,
        mode,
        platform,
        devServer,
        output: {
          bundleFilename,
          sourceMapFilename,
          assetsPath,
        },
      }),
      new webpack.DefinePlugin({
        /**
         * app 版本号
         */
        __APP_DEFINE_VERSION__: `"${pkg.version}"`,
        /**
         * app 打包时间
         */
        __APP_DEFINE_BUILD_TIME__:`"${new Date().getTime()}"`,
      }),
      new Repack.plugins.ModuleFederationPlugin({
        name: 'host',
        shared: {
          ...sharedObj,
          react: {
            ...Repack.Federated.SHARED_REACT,
            requiredVersion: pkg.dependencies.react.replace(/\^/gi, '')
          },
          'react-native': {
            ...Repack.Federated.SHARED_REACT_NATIVE,
            requiredVersion: pkg.dependencies['react-native'].replace(/\^/gi, '')
          },
        },
      }),
    ],
  };
};
