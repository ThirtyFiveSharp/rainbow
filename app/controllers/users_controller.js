load('application');

action('show', function () {
    User.find(context.req.params.id, function (err, user) {
        if(!user) {
           return send(404);
        }
        context.res.header('Content-Type', 'application/json');
        return send({
            id: user.id,
            token: user.token,
            links: [
                {rel: 'joinup', href: path_to.rainbow(user.id)}
            ]
        });
    });
});

action('create', function () {
    var uuid = require('node-uuid');
    var user = {
        id: uuid.v4(),
        token: uuid.v4()
    };
    User.create(user, function (err, user) {
        context.res.header('location', path_to.user(user.id));
        send(201);
    });
});