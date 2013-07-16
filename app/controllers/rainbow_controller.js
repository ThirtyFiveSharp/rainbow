load('application');

action('joinup', function () {
    var query = context.req.query,
        signature = query.signature,
        timestamp = query.timestamp,
        nonce = query.nonce,
        echoStr = query.echostr;
    var expectedSignature = createSha1Content('token', timestamp, nonce);
    if (signature == expectedSignature) {
        send(echoStr);
    } else {
        send(400);
    }
});

function createSha1Content(token, timestamp, nonce) {
    var crypto = require('crypto'),
        shasum = crypto.createHash('sha1');
    var array = [token, timestamp, nonce];
    array.sort();
    shasum.update(array[0]);
    shasum.update(array[1]);
    shasum.update(array[2]);
    return shasum.digest('hex');
}