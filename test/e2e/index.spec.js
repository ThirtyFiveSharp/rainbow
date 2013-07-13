var request = require('supertest'), app, compound;

describe('index', function () {
    beforeEach(function (done) {
        app = getApp();
        compound = app.compound;
        compound.on('ready', function () {
            done();
        });
    });

    it('should return 200 ok', function (done) {
        request(app)
            .get('/')
            .end(function (err, res) {
                res.should.have.status(200);
                done();
            });
    });
});