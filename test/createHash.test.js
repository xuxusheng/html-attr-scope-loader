var expect = require('chai').expect
var createHash = require('../lib/createHash')

describe('生成 hash 值', function () {

    it('simple html, 10 characters', function () {
        var html = '<div></div>'
        expect(createHash(html, 10)).to.be.equal('_8f610518a2')
    })

    it('complex html, 15 characters', function() {
        var html = '<div class="div"><p id="p"><span><a>html</a></span></p></div>'
        expect(createHash(html, 15)).to.be.equal('_acf1edaf66a09a9')

    })
})