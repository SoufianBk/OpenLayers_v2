const express = require('express')
const cors = require('cors');
const app = express()
const port = 3001

const db = require('./dbqueries')

const corsOptions = {
    origin: 'localhost:3001/', // Remplacez par le domaine de votre application OpenLayers
    methods: ['GET'], // Spécifiez les méthodes HTTP autorisées
};
app.use(cors(corsOptions));

app.use(express.json())
app.use(function (req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Access-Control-Allow-Headers');
    next();
});

app.get('/json', (req, res) => {
    db.getTrips()
        .then(response => {
            res.status(200).send(response.rows);
        })
        .catch(error => {
            res.status(500).send(error);
        })
})

app.get('/json/ts', (req, res) => {
    db.getTripsMinMaxTS()
        .then(response => {
            res.status(200).send(response.rows);
        })
        .catch(error => {
            res.status(500).send(error);
        })
})

app.get('/tiles/:z/:x/:y', db.getTiles)

app.listen(port, () => {
    console.log(`App running on port ${port}.`)
})