// express app that allows for viewing of visualization at path '/'

const express = require('express');
const app = express();
const path = require("path");


app.use(express.static(path.join(__dirname, 'public')));

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');



app.get('/', (req, res) => {
  res.render('index');
});

app.get('/info', (req, res) => {
  res.render('info');
});

app.get('/blockColors.json', (req, res) => {
  res.sendFile('blockColors.json');
});

app.get('/blocks.geojson', (req, res) => {
  res.sendFile('/blocks.geojson');
});


const port = Number(process.env.PORT || 8080);
app.listen(port);
