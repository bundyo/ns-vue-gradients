const { relative, resolve, sep } = require("path");

const path = require("path");
const webpack = require("webpack");
const winston = require('winston-color');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const OptimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const NativeScriptVueTarget = require('nativescript-vue-target');

const nsWebpack = require("nativescript-dev-webpack");
const CleanWebpackPlugin = require("clean-webpack-plugin");
const { BundleAnalyzerPlugin } = require("webpack-bundle-analyzer");
const { NativeScriptWorkerPlugin } = require("nativescript-worker-loader/NativeScriptWorkerPlugin");
const UglifyJsPlugin = require("uglifyjs-webpack-plugin");

// Prepare NativeScript application from template (if necessary)
//require('./prepare')();

// Generate platform-specific webpack configuration
module.exports = env => {
    // Add your custom Activities, Services and other android app components here.
    // const appComponents = [
    //     "tns-core-modules/ui/frame",
    //     "tns-core-modules/ui/frame/activity",
    // ];

    const platform = env && (env.android && "android" || env.ios && "ios");
    if (!platform) {
        throw new Error("You need to provide a target platform!");
    }

    const platforms = ["ios", "android"];
    const projectRoot = __dirname;
    nsWebpack.loadAdditionalPlugins({ projectDir: projectRoot });

    // Default destination inside platforms/<platform>/...
    const dist = resolve(projectRoot, nsWebpack.getAppPath(platform, projectRoot));
    const appResourcesPlatformDir = platform === "android" ? "Android" : "iOS";

    const {
        // The 'appPath' and 'appResourcesPath' values are fetched from
        // the nsconfig.json configuration file
        // when bundling with `tns run android|ios --bundle`.
        appPath = "app",
        appResourcesPath = "app/App_Resources",

        // You can provide the following flags when running 'tns run android|ios'
        snapshot, // --env.snapshot
        uglify, // --env.uglify
        report, // --env.report
    } = env;

    const appFullPath = resolve(projectRoot, appPath);
    const appResourcesFullPath = resolve(projectRoot, appResourcesPath);

    const entryModule = nsWebpack.getEntryModule(appFullPath);
    const entryPath = `.${sep}${entryModule}.js`;

    winston.info(`Bundling application for ${platform}...`);

    // CSS / SCSS style extraction loaders
    const cssLoader = ExtractTextPlugin.extract({
        use: [
            {
                loader: 'css-loader',
                options: {minimize: false, url: false},
            },
        ],
    });
    const scssLoader = ExtractTextPlugin.extract({
        use: [
            {
                loader: 'css-loader',
                options: {
                    minimize: false,
                    url: false,
                    includePaths: [resolve(__dirname, 'node_modules')],
                },
            },
            'sass-loader',
        ],
    });


    const config = {

        //mode: uglify ? "production" : "development",
        context: appFullPath,
        watchOptions: {
            ignored: [
                appResourcesFullPath,
                // Don't watch hidden files
                "**/.*",
            ]
        },

        target: NativeScriptVueTarget,

        entry: {
            bundle: entryPath,
        },

        output: {
            pathinfo: false,
            path: dist,
            libraryTarget: "commonjs2",
            filename: `[name].js`,
            //globalObject: "global",
        },

        resolve: {
            extensions: [
                `.${platform}.css`,
                '.css',
                `.${platform}.scss`,
                '.scss',
                `.${platform}.js`,
                '.js',
                `.${platform}.vue`,
                '.vue',
            ],
            // Resolve {N} system modules from tns-core-modules
            modules: [
                path.resolve(__dirname, "node_modules/tns-core-modules"),
                path.resolve(__dirname, "node_modules")
            ],
            alias: {
                '~': appFullPath
            },
            // don't resolve symlinks to symlinked modules
            symlinks: false
        },
        resolveLoader: {
            // don't resolve symlinks to symlinked loaders
            symlinks: false
        },
        node: {
            // Disable node shims that conflict with NativeScript
            "http": false,
            "timers": false,
            "setImmediate": false,
            "fs": "empty",
            //"__dirname": false,
        },
        devtool: "none",
        // optimization:  {
        //     splitChunks: {
        //         cacheGroups: {
        //             vendor: {
        //                 name: "vendor",
        //                 chunks: "all",
        //                 test: (module, chunks) => {
        //                     const moduleName = module.nameForCondition ? module.nameForCondition() : '';
        //                     return /[\\/]node_modules[\\/]/.test(moduleName) ||
        //                             appComponents.some(comp => comp === moduleName);
        //
        //                 },
        //                 enforce: true,
        //             },
        //         }
        //     },
        //     minimize: !!uglify,
        //     minimizer: [
        //         new UglifyJsPlugin({
        //             uglifyOptions: {
        //                 parallel: true,
        //                 cache: true,
        //                 output: {
        //                     comments: false,
        //                 },
        //                 compress: {
        //                     // The Android SBG has problems parsing the output
        //                     // when these options are enabled
        //                     'collapse_vars': platform !== "android",
        //                     sequences: platform !== "android",
        //                 }
        //             }
        //         })
        //     ],
        // },

        module: {
            rules: [
                // {
                //     test: new RegExp(entryPath),
                //     use: [
                //         // Require all Android app components
                //         platform === "android" && {
                //             loader: "nativescript-dev-webpack/android-app-components-loader",
                //             options: { modules: appComponents }
                //         },
                //
                //         {
                //             loader: "nativescript-dev-webpack/bundle-config-loader",
                //             options: {
                //                 registerPages: true, // applicable only for non-angular apps
                //                 loadCss: !snapshot, // load the application css if in debug mode
                //             }
                //         },
                //     ].filter(loader => !!loader)
                // },

                { test: /\.(html|xml)$/, use: "nativescript-dev-webpack/xml-namespace-loader"},

                {
                    test: /\.css$/,
                    use: cssLoader,
                },
                {
                    test: /\.scss$/,
                    use: scssLoader,
                },

                {
                    test: /\.vue$/,
                    loader: 'ns-vue-loader',
                    options: {
                        loaders: {
                            css: cssLoader,
                            scss: scssLoader,
                        },
                    },
                },
            ],
        },

        plugins: [

            // Extract CSS to separate file
            new ExtractTextPlugin({filename: `app.${platform}.css`}),

            // Optimize CSS output
            new OptimizeCssAssetsPlugin({
                cssProcessor: require('cssnano'),
                cssProcessorOptions: {
                    discardComments: {removeAll: true},
                    normalizeUrl: false
                },
                canPrint: false,
            }),

            // Define useful constants like TNS_WEBPACK
            new webpack.DefinePlugin({
                "global.TNS_WEBPACK": "true",
            }),
            // Remove all files from the out dir.
            new CleanWebpackPlugin([ `${dist}/**/*` ]),
           // Copy native app resources to out dir.
            new CopyWebpackPlugin([
              {
                from: `${appResourcesFullPath}/${appResourcesPlatformDir}`,
                to: `${dist}/App_Resources/${appResourcesPlatformDir}`,
                context: projectRoot
              },
            ]),
            // Copy assets to out dir. Add your own globs as needed.
            new CopyWebpackPlugin([
                { from: "fonts/**" },
                { from: "**/*.jpg" },
                { from: "**/*.png" },
            ], { ignore: [`${relative(appPath, appResourcesFullPath)}/**`] }),
            // Generate a bundle starter script and activate it in package.json
            new nsWebpack.GenerateBundleStarterPlugin([
                "./bundle",
            ]),
            // For instructions on how to set up workers with webpack
            // check out https://github.com/nativescript/worker-loader
            new NativeScriptWorkerPlugin(),
            new nsWebpack.PlatformFSPlugin({
                platform,
                platforms,
            }),
            // Does IPC communication with the {N} CLI to notify events when running in watch mode.
            new nsWebpack.WatchStateLoggerPlugin(),
        ],

        stats: 'errors-only',
    };

// // Determine platform(s) and action from webpack env arguments
//     const action = (!env || !env.tnsAction) ? 'build' : env.tnsAction;
//
//     if (!env || (!env.android && !env.ios)) {
//         return [config('android'), config('ios', action)];
//     }
//
//     return env.android && config('android', `${action} android`)
//         || env.ios && config('ios', `${action} ios`)
//         || {};
//
    if (report) {
        // Generate report files for bundles content
        config.plugins.push(new BundleAnalyzerPlugin({
            analyzerMode: "static",
            openAnalyzer: false,
            generateStatsFile: true,
            reportFilename: resolve(projectRoot, "report", `report.html`),
            statsFilename: resolve(projectRoot, "report", `stats.json`),
        }));
    }

    if (snapshot) {
        config.plugins.push(new nsWebpack.NativeScriptSnapshotPlugin({
            chunk: "vendor",
            requireModules: [
                "tns-core-modules/bundle-entry-points",
            ],
            projectRoot,
            webpackConfig: config,
        }));
    }

    return config;

};
