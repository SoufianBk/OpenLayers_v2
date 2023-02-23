const Pool = require('pg').Pool
const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'mobilitydb',
    password: 'postgres',
    port: 5432,
});

const getTrips = () => pool.query('SELECT asMFJSON(transform(trip, 4326), 2, 2)::json FROM Ships WHERE json_array_length(asMFJSON(transform(trip, 4326), 2, 2)::json -> \'coordinates\') > 200 LIMIT 1000')
const getTripsMinMaxTS = () => pool.query('SELECT MIN(tmin(transform(trip, 4326)::stbox)), MAX(tmax(transform(trip, 4326)::stbox)) FROM Ships;')
const getTripsMVT = () => pool.query('SELECT ST_AsMVT(mvt) as mvt FROM (SELECT asMVTGeom(transform(trip, 4326), stbox \'STBOX((0,0),(100,100))\') as mvt FROM Ships LIMIT 10) as t;')


//
// SELECT ST_AsText((mvt).geom) as mvt FROM (SELECT asMVTGeom(transform(trip, 4326), stbox 'STBOX((0,0),(100,100))') as mvt FROM Ships LIMIT 10) as t;

module.exports = {
    getTrips,
    getTripsMinMaxTS,
    getTripsMVT,
}