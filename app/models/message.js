var q = require('q'),
    _ = require('underscore');

module.exports = function (compound, Message) {
    Message.createNew = function createNew(spec) {
        var deferred = q.defer(),
            defaults = {createTime: new Date()},
            data = _.extend(defaults, spec);
        Message.create(data, function (err, message) {
            if(err) deferred.reject(err);
            else deferred.resolve(message);
        });
        return deferred.promise;
    };

    Message.countBySender = function countBySender(sender, userId) {
        var deferred = q.defer();
        Message.count({sender: sender, userId: userId}, function(err, count){
            if(err) deferred.reject(err);
            else deferred.resolve(count);
        });
        return deferred.promise;
    };
};