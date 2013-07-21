exports.routes = function (map) {
    // Generic routes. Add all your routes below this line
    // feel free to remove generic routes
    map.get('/rainbow/:key', 'rainbow#joinup');
    map.post('/rainbow/:key', 'rainbow#process');
    map.get('/users/:key', 'users#show');
    map.post('/users', 'users#create');
//    map.all(':controller/:action');
//    map.all(':controller/:action/:id');
};
