load('application');

action('joinup', function () {
    User.find(context.req.params.id, function (err, user) {
        if (!user) {
            return send(404);
        }
        var query = context.req.query,
            signature = query.signature,
            timestamp = query.timestamp,
            nonce = query.nonce,
            echoStr = query.echostr;
        var expectedSignature = createSha1Content(user.token, timestamp, nonce);
        if (signature == expectedSignature) {
            send(echoStr);
        } else {
            send(400);
        }
    });
});

action('process', function () {
    User.find(context.req.params.id, function (err, user) {
        var reqBody = req.body.xml;
        var result = {
            to: reqBody.FromUserName[0],
            from: reqBody.ToUserName[0],
            createTime: reqBody.CreateTime[0],
            type: 'text',
            content: reqBody.Content[0],
            flag: 0
        };
        context.res.header('Content-Type', 'application/xml');
        render(result);
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