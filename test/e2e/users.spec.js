var request = require('supertest'), app, compound;

describe('users', function () {
    beforeEach(function (done) {
        app = getApp();
        compound = app.compound;
        compound.on('ready', function () {
            done();
        });
    });

    describe('get /users/:id', function() {
        var uuid = require('node-uuid');

        it('should contain echostr in response', function (done) {
            var echoStr = uuid.v4();
            request(app)
                .get('/users/' + uuid.v4())
                .query({
                    signature: '',
                    timestamp: '',
                    nonce: '',
                    echostr: echoStr
                })
                .end(function (err, res) {
                    res.should.have.status(200);
                    res.text.should.equal(echoStr);
                    done();
                });
        });
    });
});