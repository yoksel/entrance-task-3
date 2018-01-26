const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const pagesRoutes = require('./pages/routes');
const graphqlRoutes = require('./graphql/routes');
const engines = require('consolidate');

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use('/', pagesRoutes);
app.use('/graphql', graphqlRoutes);
app.use(express.static(path.join(__dirname, 'public')));

// Templates
app.set('views', path.join(__dirname, 'src/templates'));
app.engine('html', engines.mustache);
app.set('view engine', 'html');

app.listen(3000, () => console.log('Express app listening on localhost:3000'));
