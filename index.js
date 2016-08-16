'use strict'
var createHash = require('./lib/createHash')
var parseHtml = require('./lib/parse')
var processLinks = require('./lib/processLinks')

var loaderUtils = require('loader-utils')
var minify = require('html-minifier').minify

module.exports = function (content) {

    this.cacheable && this.cacheable()
    var callback = this.async()
    var query = loaderUtils.parseQuery(this.query)
    var scopeLen = query.scopeLen || 10

    content = minify(content, {
        removeComments: true,
        collapseWhitespace: true
    })

    // 根据当前的 html 字符串创建一个 hash 值，作为自定义属性
    var scope = createHash(content, scopeLen)
    // 给 html 加上自定义属性
    var parseResults = parseHtml(content, scope)

    // links 中存放待引入的 css 文件的相对路径
    var links = parseResults.links

    // newHtml 中存放最后 callback 中需要抛出的 html 字符串
    var newHtml = JSON.stringify(parseResults.newHtml)

    var results = []

    if (links.length !== 0) results = processLinks(links, scope)

    results.push(
        'module.exports = ' + newHtml + ';'
    )

    callback(null, results.join('\r\n'))
}

