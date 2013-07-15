load('application');

action('verify', function () {
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

action('show', function () {
    send(200);
});

action('create', function () {
    var uuid = require('node-uuid');
    var user = {
        id: uuid.v4(),
        token: uuid.v4()
    };
    User.create(user, function (err, user) {
        context.res.header('location', path_to.user(user.id));
        send(201);
    });
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