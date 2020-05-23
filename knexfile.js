const path = require('path');

require('dotenv').config({
   path: path.join(__dirname, 'config', process.env.NODE_ENV, '.env')
});

module.exports = {
   dev: {
      client: 'pg',
      connection: {
         host: process.env.DB_HOST,
         database: process.env.DB_NAME,
         user: process.env.DB_USER,
         password: ''
      },
      pool: {
         min: 2,
         max: 10
      },
      migrations: {
         directory: path.join(__dirname, 'db', 'migrations'),
         tableName: 'knex_migrations'
      }
   },
   test: {
      client: 'pg',
      connection: {
         host: process.env.DB_HOST,
         database: process.env.DB_NAME,
         user: process.env.DB_USER,
         password: ''
      },
      pool: {
         min: 2,
         max: 10
      },
      migrations: {
         directory: path.join(__dirname, 'db', 'migrations'),
         tableName: 'knex_migrations'
      }
   },
   prod: {
      client: 'pg',
      connection: {
         host: process.env.DB_HOST,
         database: process.env.DB_NAME,
         user: process.env.DB_USER,
         password: process.env.DB_PASSWORD
      },
      pool: {
         min: 2,
         max: 10
      },
      migrations: {
         directory: path.join(__dirname, 'db', 'migrations'),
         tableName: 'knex_migrations'
      }
   }
};
