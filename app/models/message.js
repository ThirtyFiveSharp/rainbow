var q = require('q');

module.exports = function (compound, Message) {
    Message.createNew = function createNew(spec) {
        var deferred = q.defer();
        Message.create(spec, function (err, message) {
            if(err) deferred.reject(err);
            else deferred.resolve(message);
        });
        return deferred.promise;
    };
};