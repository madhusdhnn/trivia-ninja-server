const express = require('express');
const router = express.Router();
const axios = require('axios');
const log4js = require('log4js');
const {domain, enableLogging} = require('../commons/utils');
const logger = enableLogging(log4js.getLogger('AuthApiRouter'));
const knex = require('../commons/db');
const crypto = require('crypto');

router.post('/register', function (req, res, next) {
   axios.get(`${domain}/api_token.php?command=request`)
      .then(response => {
         logger.info(`Session token created successfully. Response from API server: ${JSON.stringify(response.data)}`)
         const {token} = response.data;
         const {username} = req.body;
         return knex('users')
            .where('username', username)
            .select(['user_id', 'username'])
            .then(resultSet => {
               if (!resultSet || resultSet.length === 0) {
                  const userId = crypto.randomBytes(10).toString('hex');
                  return knex('users')
                     .returning('user_id')
                     .insert({user_id: userId, is_active: true, username: username, trivia_api_token: token, created_at: new Date()});
               } else {
                  return knex('users')
                     .returning('user_id')
                     .where({user_id: resultSet[0].user_id, username: resultSet[0].username})
                     .update({trivia_api_token: token, is_active: true});
               }
            });
      })
      .then(resultSet => {
         res.json({userId: resultSet[0]});
      })
      .catch(err => {
         logger.error(`Error while creating session token - ${err.message ? err.message : JSON.stringify(err)}`);
         if (err.response && err.response.status === 403) {
            next({status: 403});
         } else {
            next({status: 400, message: 'Something went wrong. Please try again'});
         }
      })
   ;
});

module.exports = {
   path: '/quiz/auth',
   router: router
}
