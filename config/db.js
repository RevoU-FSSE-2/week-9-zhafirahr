const mysql = require('mysql2');
const connections = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'db_mbank',
    multipleStatements: true,
});
connections.connect((err) => {
    if (err) throw err;
    console.log('MySQL Connected...');
});

module.exports = connections;
