var parse5 = require('parse5')
var TreeAdapter = parse5.treeAdapters.htmlparser2
var traverse = require('./traverse')

module.exports = function(html, scope) {

    // html 字符串转化为 AST 结构
    var fragment = parse5.parseFragment(html, { treeAdapter: TreeAdapter })

    // 遍历所有的节点 , 并获取所有的 link 标签所引用的文件路径
    var links = traverse(fragment, scope)

    // 将修改后的 AST 结构重新转化为 html 字符串并返回
    var newHtml = parse5.serialize(fragment, { treeAdapter: TreeAdapter })

    return {
        newHtml: newHtml,
        links: links
    }
}