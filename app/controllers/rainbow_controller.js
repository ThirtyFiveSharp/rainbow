var q = require('q');

load('application');

action('joinup', function () {
    User.findByKey(context.req.params.key)
        .then(authenticateSignature)
        .then(returnEchoString, return404NotFound)
        .done();
});

action('process', function () {
    User.findByKey(context.req.params.key)
        .then(authenticateSignature)
        .spread(buildResponseMessage, return404NotFound)
        .done();
});

function authenticateSignature (user) {
    var deferred = q.defer(),
        query = context.req.query,
        signature = query.signature,
        secret = user && user.secret,
        timestamp = query.timestamp,
        nonce = query.nonce;
    if (!user || !isSignatureValid(signature, secret, timestamp, nonce)) deferred.reject();
    else deferred.resolve([user, context.req.body.xml]);

    return deferred.promise;
}

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

function returnEchoString() {
    send(context.req.query.echostr);
}

function return404NotFound() {
    send(404);
}

function buildResponseMessage(user, xml) {
    var sender = xml.FromUserName[0],
        receiver = xml.ToUserName[0],
        responseBody = {
            to: sender,
            from: receiver,
            createTime: xml.CreateTime[0],
            type: 'text',
            content: xml.Content[0],
            flag: 0
        },
        receivedMessage = {
            userId: user.id,
            sender: sender,
            receiver: receiver,
            rawContent: xml
        },
        repliedMessage = {
            userId: user.id,
            sender: receiver,
            receiver: sender,
            rawContent: responseBody
        };
    context.res.header('Content-Type', 'text/xml');
    render(responseBody);
    return q.all(
        Message.createNew(receivedMessage),
        Message.createNew(repliedMessage)
    );
}