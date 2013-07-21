load('application');

action('joinup', function () {
    User.all({where: {key: context.req.params.key}, limit: 1}, function (err, users) {
        var user = users.shift(),
            query = context.req.query,
            signature = query.signature,
            secret = user && user.secret,
            timestamp = query.timestamp,
            nonce = query.nonce,
            echoStr = query.echostr;

        if (!user || !isSignatureValid(signature, secret, timestamp, nonce)) {
            send(404);
            return;
        }
        send(echoStr);
    });
});

action('process', function () {
    User.all({where: {key: context.req.params.key}, limit: 1}, function (err, users) {
        var user = users[0],
            query = context.req.query,
            signature = query.signature,
            secret = user && user.secret,
            timestamp = query.timestamp,
            nonce = query.nonce;
        if (!user || !isSignatureValid(signature, secret, timestamp, nonce)) {
            send(404);
            return;
        }

        var reqBody = req.body.xml;
        var result = {
            to: reqBody.FromUserName[0],
            from: reqBody.ToUserName[0],
            createTime: reqBody.CreateTime[0],
            type: 'text',
            content: reqBody.Content[0],
            flag: 0
        };
        context.res.header('Content-Type', 'text/xml');
        render(result);
    });
});

function isSignatureValid(signature, secret, timestamp, nonce) {
    return buildSignature(secret, timestamp, nonce) === signature;
}

function buildSignature(secret, timestamp, nonce) {
    var crypto = require('crypto'),
        shasum = crypto.createHash('sha1'),
        token = secret.replace('-', ''),
        array = [token, timestamp, nonce].sort();
    shasum.update(array[0]);
    shasum.update(array[1]);
    shasum.update(array[2]);
    return shasum.digest('hex');
}