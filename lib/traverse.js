var parse5 = require('parse5')
var TreeAdapter = parse5.treeAdapters.htmlparser2

// 存放所有引用的样式文件的 相对路径
var links = []
// 存放所有待移除的 link 标签节点
var detach = []

module.exports = function (node, scope) {
    links = []
    detach = []

    traverse(node, scope)

    // 移除所有 link 标签
    if (detach.length !== 0) detachLink(detach)

    return links
}

function traverse(node, scope) {

    // 调用添加自定义属性的函数
    addAttr(node, scope)

    // 如果此节点存在子节点，则再次遍历其子节点
    if (typeof node.children !== 'undefined') {
        node.children.forEach(function (item) {
            traverse(item, scope)
        })
    }
}

// 如果节点类型为 标签，则添加上自定义属性
function addAttr(node, scope) {
    if (node.type === 'tag') {
        (node.name === 'link') ? detach.unshift(node) : TreeAdapter.adoptAttributes(node, [{name: scope, value: ''}])
    }
}

// 移除所有 link 标签
function detachLink(detach) {
    detach.forEach(function (node) {

        links.unshift(node.attribs.href)
        TreeAdapter.detachNode(node)
    })
}