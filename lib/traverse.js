var parse5 = require('parse5')
var TreeAdapter = parse5.treeAdapters.htmlparser2

var links = []

module.exports = function(node, scope) {
    links = []
    traverse(node, scope)
    return links
}

function traverse(node, scope) {

    // 调用添加自定义属性的函数
    addAttr(node, scope)

    // 如果此节点存在子节点，则再次遍历其子节点
    if(typeof node.children !== 'undefined') {
        node.children.forEach(function(item) {
            traverse(item, scope)
        })
    }
}

// 如果节点类型为 标签，则添加上自定义属性
function addAttr(node, scope) {
    if(node.type === 'tag') {

        // 调用移除 link 标签的函数
        detachLink(node)

        TreeAdapter.adoptAttributes(node, [{name: scope, value: ''}])
    }
}

// 如果节点类型为 link，则将其移除
function detachLink(node) {
    if(node.name === 'link') {
        links.push(node.attribs.href)
        TreeAdapter.detachNode(node)
    }
}