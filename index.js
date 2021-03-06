'use strict';

let http        = require('http');
let express     = require('express');
let path        = require('path');
let bodyParser  = require('body-parser');

//config
let application = require('./application');

//routes
let workitems   = require('./routes/workitems');
let overview    = require('./routes/overview');  
let app         = express();
let server      = http.createServer(app);

app.use(bodyParser.urlencoded({extended: true}));

app.use('/workitems', workitems);
app.use('/overview', overview);

app.use('/', express.static(path.join(__dirname, 'public')));
app.use('/null', express.static(path.join(__dirname, 'public')));

app.set('port', process.env.PORT || 3000);

server.listen(app.get('port'), function () {
    console.log('CSE VSTS running on port: ' + app.get('port'));

});

module.exports = app;
