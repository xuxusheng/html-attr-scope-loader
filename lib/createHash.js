var crypto = require('crypto');

module.exports = function(data, len) {

    var hash = crypto.createHash('sha1');
    hash.update(data)
    return '_' + hash.digest('hex').substr(0, len)
}