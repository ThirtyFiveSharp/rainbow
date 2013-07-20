describe('rainbow', function () {
    var request = require('supertest'), app, compound;

    beforeEach(function (done) {
        app = getApp();
        compound = app.compound;
        compound.on('ready', function () {
            done();
        });
    });

    describe('get /rainbow/:id', function () {
        var uuid = require('node-uuid'),
            timestamp = 'timestamp',
            token = 'token',
            nonce = 'nonce',
            echoStr = uuid.v4();

        it('should verify request and send back echostr given correct signature', function (done) {
            var User = app.models.User;
            User.create({
                id: uuid.v4(),
                token: uuid.v4()
            }, function (err, user) {
                request(app)
                    .get('/rainbow/' + user.id)
                    .query({
                        signature: createSha1Content(user.token, timestamp, nonce),
                        timestamp: timestamp,
                        nonce: nonce,
                        echostr: echoStr
                    })
                    .expect(200, echoStr, done);
            });

        });

        it('should return 400 Bad Request given incorrect signature', function (done) {
            var User = app.models.User;
            User.create({
                id: uuid.v4(),
                token: uuid.v4()
            }, function (err, user) {
                request(app)
                    .get('/rainbow/' + user.id)
                    .query({
                        signature: 'any',
                        timestamp: timestamp,
                        nonce: nonce,
                        echostr: echoStr
                    })
                    .expect(400, done);
            });
        });

        it('should return 404 Not Found when user of given id not exist', function (done) {
            request(app)
                .get('/rainbow/' + uuid.v4())
                .expect(404, done);
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
    });

    describe('post /rainbow/:id', function () {
        it('should handle request', function (done) {
            var uuid = require('node-uuid');
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
});