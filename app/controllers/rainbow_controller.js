load('application');

action('joinup', function () {
    User.findByKey(context.req.params.key)
        .then(function echoStringInResponse(user) {
            var query = context.req.query,
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
        })
        .done();
});

action('process', function () {
    User.findByKey(context.req.params.key)
        .then(function echoMessageInResponse(user) {
            var query = context.req.query,
                signature = query.signature,
                secret = user && user.secret,
                timestamp = query.timestamp,
                nonce = query.nonce;
            if (!user || !isSignatureValid(signature, secret, timestamp, nonce)) {
                send(404);
                return;
            }
            var reqBody = req.body.xml,
                result = {
                    to: reqBody.FromUserName[0],
                    from: reqBody.ToUserName[0],
                    createTime: reqBody.CreateTime[0],
                    type: 'text',
                    content: reqBody.Content[0],
                    flag: 0
                };
            context.res.header('Content-Type', 'text/xml');
            render(result);
        })
        .done();
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