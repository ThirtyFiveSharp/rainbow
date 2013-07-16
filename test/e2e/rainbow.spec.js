var request = require('supertest'), app, compound;

describe('rainbow', function () {
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
            request(app)
                .get('/rainbow/' + uuid.v4())
                .query({
                    signature: createSha1Content(token, timestamp, nonce),
                    timestamp: timestamp,
                    nonce: nonce,
                    echostr: echoStr
                })
                .end(function (err, res) {
                    res.should.have.status(200);
                    res.text.should.equal(echoStr);
                    done();
                });
        });

        it('should return 400 Bad Request given incorrect signature', function (done) {
            request(app)
                .get('/rainbow/' + uuid.v4())
                .query({
                    signature: 'any',
                    timestamp: timestamp,
                    nonce: nonce,
                    echostr: echoStr
                })
                .end(function (err, res) {
                    res.should.have.status(400);
                    done();
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
    });
});