exports.routes = function (map) {
    // Generic routes. Add all your routes below this line
    // feel free to remove generic routes
    map.root('index#get');
    map.get('/rainbow/:id', 'rainbow#joinup');
    map.post('/rainbow/:id', 'rainbow#process');
    map.get('/users/:id', 'users#show');
    map.post('/users', 'users#create');
//    map.all(':controller/:action');
//    map.all(':controller/:action/:id');
};
