var request = require('supertest'), app, compound;

describe('users', function () {
    beforeEach(function (done) {
        app = getApp();
        compound = app.compound;
        compound.on('ready', function () {
            done();
        });
    });

    describe('post /users', function () {
        it('should create user and return created user uri', function (done) {
            request(app)
                .post('/users')
                .expect('Location', /\/users\/[0-9a-fA-F]{8}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{12}/)
                .expect(201, done);
        });
    });

    describe('get /users/:key', function () {
        var uuid = require('node-uuid');

        it('should return specific user information', function (done) {
            var User = app.models.User;
            User.create({
                key: uuid.v4(),
                secret: uuid.v4()
            }, function(err, user) {
                request(app)
                    .get('/users/' + user.key)
                    .expect('Content-Type', 'application/json')
                    .expect(200, {
                        key: user.key,
                        secret: user.secret,
                        links: [
                            {rel: 'joinup', href: '/rainbow/' + user.key}
                        ]
                    }, done);
            });
        });

        it('should return 404 not found given invalid user key', function(done) {
           request(app)
               .get('/users/' + 'invalidUserKey')
               .expect(404, done);
        });
    });
});