// const path = require("path");

const { minimizer, webpackPlugins } = require("./webpack.plugins");

const NodeEnv = {
  Production: process.env.NODE_ENV === "production",
  Development: process.env.NODE_ENV === "development"
};

// 线上打包路径，请根据项目实际线上情况
const BASE_URL = NodeEnv.Production ? "/" : "/";

module.exports = {
  publicPath: BASE_URL,
  outputDir: "dist", // 打包生成的生产环境构建文件的目录
  assetsDir: "", // 放置生成的静态资源路径，默认在outputDir
  indexPath: "index.html", // 指定生成的 index.html 输入路径，默认outputDir
  pages: undefined, // 构建多页
  runtimeCompiler: true,
  productionSourceMap: false, // 开启 生产环境的 source map
  configureWebpack: {
    plugins: webpackPlugins,
    optimization: {
      minimizer: minimizer
    }
    // externals: {
    //   dface: 'dface'
    // }
  },

  devServer: {
    publicPath: "/",
    proxy: {
      "/api": {
        target: "https://zakynthos-dev.dface.cn/", // 后台接口域名
        changeOrigin: true, //是否跨域
        pathRewrite: {
          "^/api": "/api"
        }
      }
    }
  }
};
