const Pool = require('pg').Pool
const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'mobilitydb',
    password: 'postgres',
    port: 5432,
});

const getMerchants = () => pool.query('SELECT * FROM Merchants ORDER BY id ASC')

const getTest = () => pool.query('SELECT * FROM spatial_ref_sys LIMIT 10')

const createMerchant = (body) => {
    const { name, email } = body
    pool.query('INSERT INTO Merchants (name, email) VALUES ($1, $2) RETURNING *', [name, email])
}

const deleteMerchant = () => {
    const id = parseInt(request.params.id)
    pool.query('DELETE FROM Merchants WHERE ID = $1', [id])
}

module.exports = {
    getMerchants,
    createMerchant,
    deleteMerchant,
    getTest,
}