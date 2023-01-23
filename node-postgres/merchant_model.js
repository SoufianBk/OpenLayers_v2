const Pool = require('pg').Pool
const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'mobilitydb',
    password: 'postgres',
    port: 5432,
});

const getTrips = () => pool.query('SELECT asMFJSON(transform(trip, 4326), 2, 2) FROM Ships LIMIT 10')

module.exports = {
    getTrips,
}