'use strict'
var createHash = require('./lib/createHash')
var parseHtml = require('./lib/parse')

var ExtractTextPlugin = require('extract-text-webpack-plugin')
var loaderUtils = require('loader-utils');

let ENV = process.env.npm_lifecycle_event;
let isTest = ENV === 'test' || ENV === 'test-watch';
let isProd = ENV === 'build' || ENV === 'release';

module.exports = function (content) {

    this.cacheable && this.cacheable();
    var callback = this.async();
    var query = loaderUtils.parseQuery(this.query);
    var scopeLen = query.scopeLen || 10

    // 根据当前的 html 字符串创建一个 hash 值，作为自定义属性
    var scope = createHash(content, scopeLen)
    // 给 html 加上自定义属性
    var parseResults = parseHtml(content, scope)

    // links 中存放待引入的 css 文件的相对路径
    var links = parseResults.links

    // newHtml 中存放最后 callback 中需要抛出的 html 字符串
    var newHtml = JSON.stringify(parseResults.newHtml)

    var results = []

    if(links.length !== 0) {

        // 如果html中存在 link 标签
        links.forEach(function(link) {

            // 整理出 require() 中需要填入的字符串
            var loader = isTest ? 'null' : isProd ? ExtractTextPlugin.extract('style', 'css!css-attr-scope?scope=' + scope + '!postcss?parser=postcss-scss') : ExtractTextPlugin.extract('style', 'css?sourceMap!css-attr-scope?scope=' + scope + '!postcss?parser=postcss-scss')

            // 判断是否是 window 环境
            loader = process.platform.indexOf('win') !== -1 ? loader.replace(/\\/g, '\\\\') : loader

            // 将拼接好的 require() 规则存入 results 数组中
            results.push(
                'require(\'!' + loader + '!' + link + '\');'
            )
        })
    }

    results.push(
        'module.exports = ' + newHtml + ';'
    )

    callback(null, results.join('\r\n'))
}

