var parse5 = require('parse5')
var TreeAdapter = parse5.treeAdapters.htmlparser2

// 存放所有引用的样式文件的 相对路径
var links = []
// 存放所有待移除的 link 标签节点
var detach = []
// 存放所有 img 标签中 src 属性
var imgSrcMap = {}

module.exports = function (node, scope) {
    links = []
    detach = []
    imgSrcMap = {}

    traverse(node, scope)

    // 移除所有 link 标签
    if (detach.length !== 0) detachLink(detach)

    return {
        links: links,
        imgSrcMap: imgSrcMap
    }
}

function traverse(node, scope) {

    // 调用添加自定义属性的函数
    if (node.type === 'tag') addAttr(node, scope)

    // 处理 script 中的 html 字符串，使用 parse5 时默认会将其识别为 text 节点，所以需要手动再转换一遍
    if (node.type === 'script' && node.attribs.type === 'text/ng-template') {
        var html = node.children[0].data
        var fragment = parse5.parseFragment(html, {treeAdapter: TreeAdapter})
        traverse(fragment, scope)
        node.children[0].data  = parse5.serialize(fragment, {treeAdapter: TreeAdapter})
    }

    // 如果此节点存在子节点，则再次遍历其子节点
    if (typeof node.children !== 'undefined') {
        node.children.forEach(function (item) {
            traverse(item, scope)
        })
    }
}

// 如果节点类型为 标签，则添加上自定义属性
function addAttr(node, scope) {

    node.name === 'link' ? detach.unshift(node) : TreeAdapter.adoptAttributes(node, [{name: scope, value: ''}])

    if(node.name === 'img' && !!node.attribs.src) {
        do {
            var index = randomIdent()
        } while (imgSrcMap[index])
        imgSrcMap[index] = node.attribs.src
        node.attribs.src = index
    }
}

// 移除所有 link 标签
function detachLink(detach) {
    detach.forEach(function (node) {
        if (!node.attribs.href) throw new Error('未找到link标签中的 href 属性')
        links.unshift(node.attribs.href)
        TreeAdapter.detachNode(node)
    })
}

function randomIdent() {
    return 'xxxHTMLLINKxxx' + Math.random() + Math.random() + 'xxx';
}