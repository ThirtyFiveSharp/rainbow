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
    User.find(context.req.params.id, function (err, user) {
        if(!user) {
           return send(404);
        }
        context.res.header('Content-Type', 'application/json');
        return send({
            id: user.id,
            token: user.token,
            links: [
                {rel: 'verify', href: path_to.verify_user(user.id)}
            ]
        });
    });
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