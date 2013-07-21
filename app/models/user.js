var q = require('q'),
    _ = require('underscore'),
    uuid = require('node-uuid');

module.exports = function (compound, User) {
    User.createNew = function createNew(spec) {
        var deferred = q.defer(),
            defaults = {
                key: uuid.v4(),
                secret: uuid.v4()
            },
            data = _.extend(defaults, spec);
        User.create(data, function (err, user) {
            if (err) deferred.reject(err);
            else  deferred.resolve(user);
        });
        return deferred.promise;
    };

    User.findByKey = function findByKey(key) {
        var deferred = q.defer();
        User.all({where: {key: key}, limit: 1}, function (err, users) {
            if (err) deferred.reject(err);
            else deferred.resolve(users[0]);
        });
        return deferred.promise;
    };
};