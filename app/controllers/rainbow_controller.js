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
        .then(buildResponseMessageForWeChat, return404NotFound)
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
    else deferred.resolve(user);
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

function buildResponseMessageForWeChat(user) {
    var xml = context.req.body.xml,
        sender = xml.FromUserName[0],
        receiver = xml.ToUserName[0],
        receivedMessage = {
            userId: user.id,
            sender: sender,
            receiver: receiver,
            content: xml.Content[0],
            createTime: fromWeChatTime(xml.CreateTime[0])
        };
    return generateResponseMessage(receivedMessage)
        .then(function createResponseMessage(responseMessage) {
            var responseBody = {
                    to: responseMessage.receiver,
                    from: responseMessage.sender,
                    createTime: toWeChatTime(responseMessage.createTime),
                    type: 'text',
                    content: responseMessage.content,
                    flag: 0
                };
            context.res.header('Content-Type', 'text/xml');
            render(responseBody);
        });
}

function generateResponseMessage(receivedMessage) {
    return Message.createNew(receivedMessage)
        .then(function getStatisticsOfUserActivities() {
            return Message.countBySender(receivedMessage.sender, receivedMessage.userId);
        })
        .then(function createResponseMessage(count) {
            var responseMessage = {
                userId: receivedMessage.userId,
                sender: receivedMessage.receiver,
                receiver: receivedMessage.sender,
                content: receivedMessage.content + ' [You have sent ' + count + ' message(s).]'
            };
            return Message.createNew(responseMessage);
        });
}

function toWeChatTime(date) {
    return Math.floor(date.getTime() / 1000);
}

function fromWeChatTime(timestamp) {
    return new Date(parseInt(timestamp, 10) * 1000);
}