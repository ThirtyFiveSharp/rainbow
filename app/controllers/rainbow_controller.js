load('application');

action('joinup', function () {
    User.find(context.req.params.id, function (err, user) {
        var query = context.req.query,
            signature = query.signature,
            token = user && user.token,
            timestamp = query.timestamp,
            nonce = query.nonce,
            echoStr = query.echostr;

        if (!user || !isSignatureValid(signature, token, timestamp, nonce)) {
            send(404);
            return;
        }
        send(echoStr);
    });
});

action('process', function () {
    User.find(context.req.params.id, function (err, user) {
        var query = context.req.query,
            signature = query.signature,
            token = user && user.token,
            timestamp = query.timestamp,
            nonce = query.nonce;
        if (!user || !isSignatureValid(signature, token, timestamp, nonce)) {
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

function isSignatureValid(signature, token, timestamp, nonce) {
    return buildSignature(token, timestamp, nonce) === signature;
}

function buildSignature(token, timestamp, nonce) {
    var crypto = require('crypto'),
        shasum = crypto.createHash('sha1'),
        array = [token, timestamp, nonce].sort();
    shasum.update(array[0]);
    shasum.update(array[1]);
    shasum.update(array[2]);
    return shasum.digest('hex');
}