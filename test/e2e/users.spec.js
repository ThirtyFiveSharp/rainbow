var request = require('supertest'), app, compound;

describe('users', function () {
    beforeEach(function (done) {
        app = getApp();
        compound = app.compound;
        compound.on('ready', function () {
            done();
        });
    });

    describe('get /users/:id/verify', function () {
        var uuid = require('node-uuid'),
            timestamp = 'timestamp',
            token = 'token',
            nonce = 'nonce',
            echoStr = uuid.v4();

        it('should verify request and send back echostr given correct signature', function (done) {
            request(app)
                .get('/users/' + uuid.v4() + '/verify')
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
                .get('/users/' + uuid.v4() + '/verify')
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

    describe('post /users', function () {
        it('should create user and return created user uri', function (done) {
            request(app)
                .post('/users')
                .expect('location', /\/users\/[0-9a-fA-F]{8}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{12}/)
                .expect(201, done);
        });
    });

    describe('get /users/:id', function () {
        var uuid = require('node-uuid');

        it('should return specific user information', function (done) {
            var User = app.models.User;
            User.create({
                id: uuid.v4(),
                token: uuid.v4()
            }, function(err, user) {
                request(app)
                    .get('/users/' + user.id)
                    .expect('Content-Type', 'application/json')
                    .expect(200, {
                        id: user.id,
                        token: user.token,
                        links: [
                            {rel: 'verify', href: '/users/' + user.id + '/verify'}
                        ]
                    }, done);
            });
        });

        it('should return 404 not found when user not exists', function(done) {
           request(app)
               .get('/users/' + uuid.v4())
               .expect(404, done);
        });
    });
});