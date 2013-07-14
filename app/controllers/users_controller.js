load('application');

action('joinup', function () {
    var echostr = context.req.query.echostr;
    send(echostr);
});