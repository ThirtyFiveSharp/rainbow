load('application');

action('show', function () {
    User.all({where: {key: context.req.params.key}, limit: 1}, function (err, users) {
        var user = users[0];
        if(!user) {
           return send(404);
        }
        context.res.header('Content-Type', 'application/json');
        return send({
            key: user.key,
            secret: user.secret,
            links: [
                {rel: 'joinup', href: path_to.rainbow(user.key)}
            ]
        });
    });
});

action('create', function () {
    var uuid = require('node-uuid');
    var user = {
        key: uuid.v4(),
        secret: uuid.v4()
    };
    User.create(user, function (err, user) {
        context.res.header('location', path_to.user(user.key));
        send(201);
    });
});