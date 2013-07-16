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
                            {rel: 'joinup', href: '/rainbow/' + user.id }
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