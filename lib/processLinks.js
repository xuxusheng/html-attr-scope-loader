var ExtractTextPlugin = require('extract-text-webpack-plugin')

var ENV = process.env.npm_lifecycle_event
var isTest = ENV === 'test' || ENV === 'test-watch'
var isProd = ENV === 'build' || ENV === 'release'

module.exports = function (links, scope) {

    var results = []
    links.forEach(function (link) {

        // 整理出 require() 中需要填入的字符串
        var loader = isTest ? 'null' : isProd ? ExtractTextPlugin.extract('style', 'css!css-attr-scope?scope=' + scope + '!postcss?parser=postcss-scss') : ExtractTextPlugin.extract('style', 'css?sourceMap!css-attr-scope?scope=' + scope + '!postcss?parser=postcss-scss')

        // 判断是否是 window 环境
        loader = process.platform.indexOf('win') !== -1 ? loader.replace(/\\/g, '\\\\') : loader

        // 将拼接好的 require() 规则存入 results 数组中
        results.push(
            'require(\'!' + loader + '!' + link + '\');'
        )
    })

    return results
}