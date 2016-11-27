'use strict'
var createHash = require('./lib/createHash');
var parseHtml = require('./lib/parse');
var processLinks = require('./lib/processLinks');
var assign = require('object-assign');
var loaderUtils = require('loader-utils');
var minify = require('html-minifier').minify;

function getLoaderConfig(context) {
    // 获取参数 query 格式化之后的对象
    var query = loaderUtils.parseQuery(context.query);
    // 参数中是否存在 config 属性，不存在则 configKey = 'htmlAttrScopeLoader'
    var configKey = query.config || 'htmlAttrScopeLoader'

    // context 其实指的是 this 上下文，如果它存在 options 属性，且 options 中存在 上面 参数中的 config 属性
    var config = context.options && context.options.hasOwnProperty(configKey) ? context.options[configKey] : {}

    // query 中的 config 属性已经没用了
    delete query.config

    return assign(query, config);
}

module.exports = function (content) {

    this.cacheable && this.cacheable()
    var callback = this.async()

    // this 是上下文，query 是在webpack中写loaders:[{test:/\.html$/, loader: 'html-attr-scope-loader?name=xusheng'}]时后面所跟的参数
    // query中可以带有一个config属性，这个属性可以指定调用webpack配置文件中抛出的对象的options属性中的哪个具体属性来作为 html-attr-scope-loader 的配置，默认为htmlAttrScopeLoader
    // 如果 this.query.config 并不存在且 this.options.htmlAttrScopeLoader 也不存在，那么 config 其实就是 query 格式化成一个对象而已。
    var config = getLoaderConfig(this)
    // 用来配置生成的 scope 的长度
    var scopeLen = config.scopeLen || 10

    // 根据当前的 html 字符串创建一个 hash 值，作为自定义属性
    var scope = createHash(content, scopeLen)
    config.scope = scope
    // 给 html 加上自定义属性
    var parseResults = parseHtml(content, scope)

    // links 中存放待引入的 css 文件的相对路径
    var links = parseResults.links

    // imgSrcMap 中存放 img 标签中 src 属性的 键值对， { 'xxxHTMLLINKxxx12345678xxx': './avatar.png' }
    var imgSrcMap = parseResults.imgSrcMap

    // newHtml 中存放最后 callback 中需要抛出的 html 字符串
    var newHtml = parseResults.newHtml

    // 判断 config 中是否存在 布尔类型 的 minimize 属性，
    if (typeof config.minimize === 'boolean' ? config.minimize : this.minimize) {
        // 将 config 中的属性，整个拷贝一份到 压缩配置 上去
        var minimizeOptions = assign({}, config);

        [
            'removeComments',
            'removeCommentsFromCDATA',
            'removeCDATASectionsFromCDATA',
            'collapseWhitespace',
            'conservativeCollapse',
            'removeAttributeQuotes',
            'useShortDoctype',
            'keepClosingSlash',
            'minifyJS',
            'minifyCSS',
            'removeScriptTypeAttributes',
            'removeStyleTypeAttributes'
        ].forEach(function (name) {
            // 遍历所有接收到的 config，如果没有找到相对应的选项的话就设为 true，就是默认开启所有
            if (typeof minimizeOptions[name] === 'undefined') {
                minimizeOptions[name] = true;
            }
        });

        newHtml = minify(newHtml, minimizeOptions);
    }

    newHtml = JSON.stringify(newHtml)

    var results = []

    if (links.length !== 0) results = processLinks(links, config)

    results.push(
        'module.exports = ' + newHtml.replace(/xxxHTMLLINKxxx[0-9\.]+xxx/g, function (match) {
            if (!imgSrcMap[match]) return match
            return '" + require(' + JSON.stringify(loaderUtils.urlToRequest(imgSrcMap[match])) + ') + "';
        }) + ';'
    )

    callback(null, results.join('\r\n'))
}
