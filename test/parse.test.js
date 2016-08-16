var path = require('path')
var fs = require('fs')
var expect = require('chai').expect
var parse = require('../lib/parse')
var minify = require('html-minifier').minify

var options = {
    removeComments: true,
    collapseWhitespace: true
}

var testCasesPath = path.join(__dirname, 'parseCases')
var scope = 'scope'


describe('处理 html 字符串', function () {

    it('不带 link 标签', function () {

        var source = minify(fs.readFileSync(path.join(testCasesPath, 'withoutLink', 'source.html'), 'utf-8'), options)
        var expected = fs.readFileSync(path.join(testCasesPath, 'withoutLink', 'expected.html'), 'utf-8')

        var result = parse(source, scope)

        expect(result.newHtml).to.equal(expected)
        expect(result.links).to.be.empty
    })

    it('带 link 标签', function () {

        var source = minify(fs.readFileSync(path.join(testCasesPath, 'withLink', 'source.html'), 'utf-8'), options)
        var expected = fs.readFileSync(path.join(testCasesPath, 'withLink', 'expected.html'), 'utf-8')
        var result = parse(source, scope)

        // console.log(result)

        expect(result.newHtml).to.equal(expected)
        expect(result.links).to.eql(['./index.scss', './index1.scss'])
    })
})