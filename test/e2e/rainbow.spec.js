describe('rainbow', function () {
    var request = require('supertest'), uuid = require('node-uuid'),
        app, compound;

    beforeEach(function (done) {
        app = getApp();
        compound = app.compound;
        compound.on('ready', function () {
            done();
        });
    });

    describe('get /rainbow/:id', function () {
        it('should verify request and send back echostr given correct signature', function (done) {
            var User = app.models.User;
            User.create({
                id: uuid.v4(),
                token: uuid.v4()
            }, function (err, user) {
                request(app)
                    .get('/rainbow/' + user.id)
                    .query({
                        signature: buildSignature(user.token, givenTimestamp(), givenNonce()),
                        timestamp: givenTimestamp(),
                        nonce: givenNonce(),
                        echostr: givenEchoStr()
                    })
                    .expect(200, givenEchoStr(), done);
            });

        });

        it('should return 404 Not Found given incorrect signature', function (done) {
            var User = app.models.User;
            User.create({
                id: uuid.v4(),
                token: uuid.v4()
            }, function (err, user) {
                request(app)
                    .get('/rainbow/' + user.id)
                    .query({
                        signature: 'wrongSignature',
                        timestamp: givenTimestamp(),
                        nonce: givenNonce(),
                        echostr: givenEchoStr()
                    })
                    .expect(404, done);
            });
        });

        it('should return 404 Not Found when user of given id not exist', function (done) {
            request(app)
                .get('/rainbow/' + uuid.v4())
                .expect(404, done);
        });
    });

    describe('post /rainbow/:id', function () {
        it('should return 404 Not Found given incorrect signature', function (done) {
            var requestBody = "<xml>" +
                    "<ToUserName><![CDATA[server]]></ToUserName>" +
                    "<FromUserName><![CDATA[client]]></FromUserName>" +
                    "<CreateTime>1348831860</CreateTime>" +
                    "<MsgType><![CDATA[text]]></MsgType>" +
                    "<Content><![CDATA[this_is_a_test]]></Content>" +
                    "<MsgId>1234567890123456</MsgId>" +
                    "</xml>";
            var User = app.models.User;
            User.create({
                id: uuid.v4(),
                token: uuid.v4().replace(/-/g, '')
            }, function (err, user) {
                request(app)
                    .post('/rainbow/' + user.id)
                    .query({
                        signature: 'wrongSignature',
                        timestamp: givenTimestamp(),
                        nonce: givenNonce()
                    })
                    .set('Content-Type', 'text/xml')
                    .send(requestBody)
                    .expect(404, done);
            });
        });

        it('should handle request', function (done) {
            var User = app.models.User;
            var requestBody = "<xml>" +
                    "<ToUserName><![CDATA[server]]></ToUserName>" +
                    "<FromUserName><![CDATA[client]]></FromUserName>" +
                    "<CreateTime>1348831860</CreateTime>" +
                    "<MsgType><![CDATA[text]]></MsgType>" +
                    "<Content><![CDATA[this_is_a_test]]></Content>" +
                    "<MsgId>1234567890123456</MsgId>" +
                    "</xml>",
                expectedResponseBody = "<xml>" +
                    "<ToUserName><![CDATA[client]]></ToUserName>" +
                    "<FromUserName><![CDATA[server]]></FromUserName>" +
                    "<CreateTime>1348831860</CreateTime>" +
                    "<MsgType><![CDATA[text]]></MsgType>" +
                    "<Content><![CDATA[this_is_a_test]]></Content>" +
                    "<FuncFlag>0</FuncFlag>" +
                    "</xml>";
            User.create({
                id: uuid.v4(),
                token: uuid.v4().replace(/-/g, '')
            }, function (err, user) {
                request(app)
                    .post('/rainbow/' + user.id)
                    .query({
                        signature: buildSignature(user.token, givenTimestamp(), givenNonce()),
                        timestamp: givenTimestamp(),
                        nonce: givenNonce()
                    })
                    .set('Content-Type', 'text/xml')
                    .send(requestBody)
                    .expect('Content-Type', 'text/xml')
                    .expect(200)
                    .end(function(err, res) {
                        if(err) throw err;
                        res.text.replace(/\s*/g, '').should.equal(expectedResponseBody);
                        done();
                    });
            });
        });
    });

    function givenTimestamp() {
        return 'timestamp';
    }

    function givenNonce() {
        return 'nonce';
    }

    function givenEchoStr() {
        return 'echoMe';
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
});