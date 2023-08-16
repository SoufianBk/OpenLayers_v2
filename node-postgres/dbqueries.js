const fs = require('fs');
const Pool = require('pg').Pool
const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'ais',
    password: 'postgres',
    port: 5432,
});

const table = "Ships"

const getTrips = () => pool.query('SELECT asMFJSON(transform(trip, 4326))::json FROM ' + table);
const getTripsMinMaxTS = () => pool.query('SELECT MIN(tmin(transform(trip, 4326)::stbox)), MAX(tmax(transform(trip, 4326)::stbox)) FROM ' + table)


const getTiles = (request, response) => {
    const z = parseInt(request.params.z)
    const x = parseInt(request.params.x)
    const y = parseInt(request.params.y)
    pool.query('SELECT public.tripsfct($1,$2,$3)', [z,x,y], (error, results) => {
        if (error) {
            throw error
        }

        const row = results.rows[0];
        const byteaData = row.tripsfct;

        response.set('Content-Type', 'application/octet-stream');
        response.set('Content-Disposition', 'attachment; filename="trips.pbf"');

        response.send(Buffer.from(byteaData, 'binary'));
    })
}

module.exports = {
    getTrips,
    getTripsMinMaxTS,
    getTiles,
}