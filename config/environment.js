module.exports = function (compound) {

    var express = require('express');
    var app = compound.app;
    var xml2js = require('xml2js');

    function xmlBodyParser(req, res, next) {
        if (req._body) return next();
        req.body = req.body || {};

        // ignore GET
        if ('GET' == req.method || 'HEAD' == req.method) return next();

        // check Content-Type
        if (!req.is('text/xml')) return next();

        // flag as parsed
        req._body = true;

        // parse
        var buf = '';
        req.setEncoding('utf8');
        req.on('data', function(chunk){ buf += chunk });
        req.on('end', function(){
            var parseString = xml2js.parseString;
            parseString(buf, function(err, json) {
                if (err) {
                    err.status = 400;
                    next(err);
                } else {
                    req.body = json;
                    next();
                }
            });
        });
    };

    app.configure(function(){
        app.use(express.static(app.root + '/public', { maxAge: 86400000 }));
        app.set('jsDirectory', '/javascripts/');
        app.set('cssDirectory', '/stylesheets/');
        app.set('cssEngine', 'stylus');
        app.set('view options', {layout: false});
        app.use(express.bodyParser());
        app.use(xmlBodyParser);
        app.use(express.cookieParser('secret'));
        app.use(express.session({secret: 'secret'}));
        app.use(express.methodOverride());
        app.use(app.router);
    });

};
