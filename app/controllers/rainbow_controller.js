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
        var body = "<xml>" +
            "<ToUserName><![CDATA[" + reqBody.FromUser + "]]></ToUserName>" +
            "<FromUserName><![CDATA[" + reqBody.ToUser + "]]></FromUserName>" +
            "<CreateTime>" + reqBody.CreateTime + "</CreateTime>" +
            "<MsgType><![CDATA[" + reqBody.Content + "]]></MsgType>" +
            "<Content><![CDATA[this is a test]]></Content>" +
            "<FuncFlag>0</FuncFlag>" +
            "</xml>";
        context.res.header('Content-Type', 'application/xml');
        return send(body);
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