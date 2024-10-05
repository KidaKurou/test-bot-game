const { Sequelize } = require('sequelize');

module.exports = new Sequelize(
    'telega_bot',
    'root',
    'root',
    {
        host: 'master.33996983-4a23-4c40-bb06-a48ea44798bb.c.dbaas.selcloud.ru',
        port: '5432',
        dialect: 'postgres'
    }
)