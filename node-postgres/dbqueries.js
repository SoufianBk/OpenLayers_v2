const fs = require('fs');
const Pool = require('pg').Pool
const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'ais',
    // database: 'mobilitydbdev',
    password: 'postgres',
    port: 5432,
});

const getTrips = () => pool.query('SELECT asMFJSON(transform(trip, 4326))::json FROM Ships'); //' WHERE json_array_length(asMFJSON(transform(trip, 4326), 2, 2)::json -> \'coordinates\') > 200 LIMIT 1000')
const getTripsNY = () => pool.query('SELECT asMFJSON(transform(trip, 4326))::json FROM trips_mdb');
const getTripsMinMaxTS = () => pool.query('SELECT MIN(tmin(transform(trip, 4326)::stbox)), MAX(tmax(transform(trip, 4326)::stbox)) FROM Ships;')
const getTripsMinMaxTSNY = () => pool.query('SELECT MIN(tmin(transform(trip, 4326)::stbox)), MAX(tmax(transform(trip, 4326)::stbox)) FROM trips_mdb;')
// const getTripsMVT = () => pool.query('SELECT ST_AsMVT(mvt) as mvt FROM (SELECT asMVTGeom(transform(trip, 4326), stbox \'STBOX((0,0),(100,100))\') as mvt FROM Ships LIMIT 10) as t;')
// const getTripsMixMaxTsMVT = () => pool.query('SELECT MIN(t), MAX(t) FROM trips;')


const getTiles = (request, response) => {
    const z = parseInt(request.params.z)
    const x = parseInt(request.params.x)
    const y = parseInt(request.params.y)
    const filename = z + y + x
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

//SELECT tmax(transform(trip, 4326)::stbox) as mini, asMFJSON(transform(trip, 4326), 2, 2)::json FROM Ships WHERE json_array_length(asMFJSON(transform(trip, 4326), 2, 2)::json -> 'coordinates') > 200 ORDER BY mini ASC LIMIT 50
//  SELECT ST_AsText((mvt).geom) as mvt FROM (SELECT asMVTGeom(transform(trip, 4326), stbox 'STBOX((0,0),(100,100))') as mvt FROM Ships LIMIT 10) as t;

module.exports = {
    getTrips,
    getTripsNY,
    getTripsMinMaxTS,
    getTripsMinMaxTSNY,
    getTiles,
}