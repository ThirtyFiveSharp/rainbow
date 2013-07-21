load('application');

action('show', function () {
    User.findByKey(context.req.params.key)
        .then(function returnUserInfo(user) {
            if (!user) {
                send(404);
                return;
            }
            context.res.header('Content-Type', 'application/json');
            send({
                key: user.key,
                secret: user.secret,
                links: [
                    {rel: 'joinup', href: path_to.rainbow(user.key)}
                ]
            });
        })
        .done();
});

action('create', function () {
    User.createNew()
        .then(function returnLinkOfCreatedUser (user) {
            context.res.header('Location', path_to.user(user.key));
            send(201);
        })
        .done();
});