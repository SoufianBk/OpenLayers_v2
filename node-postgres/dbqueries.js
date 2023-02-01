const Pool = require('pg').Pool
const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'mobilitydb',
    password: 'postgres',
    port: 5432,
});

const getTrips = () => pool.query('SELECT asMFJSON(transform(trip, 4326), 2, 2) FROM Ships WHERE json_array_length(asMFJSON(transform(trip, 4326), 2, 2)::json -> \'coordinates\') > 200 LIMIT 1000')

//

// SELECT asMFJSON(transform(trip, 4326), 2, 2) FROM Ships LIMIT 100

module.exports = {
    getTrips,
}