const express = require('express');
const router = express.Router();
const axios = require('axios');
const log4js = require('log4js');

const {domain, enableLogging, shuffle} = require('../commons/utils');
const logger = enableLogging(log4js.getLogger('QuizApiRouter'));
const auth = require('../commons/auth');
const knex = require('../commons/db');

const withUser = (req, next, callback) => {
   const {userId} = req.query;
   knex('users')
      .where({user_id: userId})
      .select(['user_id', 'trivia_api_token'])
      .then(user => callback({userId: user[0].user_id, token: user[0].trivia_api_token}))
      .catch(err => {
         logger.error(`Error while fetching user from database - ${JSON.stringify(err)}`)
         next({status: 401, message: 'User not found'});
      });
};

const withParams = (req, next, callback) => {
   const {totalQuestions, categoryId, difficulty, typeOfQuestion} = req.query;
   withUser(req, next, user => {
      const params = {};
      params.amount = parseInt(totalQuestions);
      params.category = parseInt(categoryId);
      params.difficulty = difficulty;
      if (typeOfQuestion) {
         params.type = typeOfQuestion;
      }
      params.token = user.token;
      callback(params, user);
   });
};

router.use(auth);

router.get('/questions', (req, res, next) => {
   withParams(req, next, (params, user) => {
      const resultHandler = responseData => {
         const {results} = responseData;
         const data = {};
         data.category = results[0].category;
         data.difficulty = results[0].difficulty;
         const quiz = results.map((ques, index) => {
            const {type, question, correct_answer, incorrect_answers} = ques;
            const id = index + 1;
            let options = [
               {
                  id: 1,
                  option: correct_answer,
                  isRight: true
               },
               ...incorrect_answers.map((incorrectAnswer, i) => ({
                  id: i + 2,
                  option: incorrectAnswer,
                  isRight: false
               }))
            ];
            options = shuffle(options);
            return {id, type, question, options};
         });
         res.json({...data, quiz: quiz});
      };

      const archiveToken = () => {
         return knex('users')
             .where({user_id: user.userId, is_active: true})
             .delete();
      }

      axios.get(`${domain}/api.php`, {params: params})
         .then(response => {
            const {response_code} = response.data;
            if (response_code === 0) {
               resultHandler(response.data);
            } else if (response_code === 1) {
               logger.info(`Response from API server: ${JSON.stringify(response.data)}`);
               next({status: 400, code: 1, message: 'Insufficient amount of questions for the requested query'});
            } else if (response_code === 2) {
               logger.info(`Response from API server: ${JSON.stringify(response.data)}`);
               next({status: 400, code: 2, message: 'Invalid parameter passed'});
            } else if (response_code === 3) {
               logger.info(`Response from API server: ${JSON.stringify(response.data)}`);
               archiveToken()
                   .then(() => next({status: 401, code: 3, message: 'Invalid Session token passed'}))
                   .catch(() => next({status: 401, code: 3, message: 'Invalid Session token passed'}));
            } else if (response_code === 4) {
               logger.info(`Response from API server: ${JSON.stringify(response.data)}`);
               logger.info(`Deleting expired user entry for user ${user.userId}`);
               archiveToken()
                   .then(() => next({
                      status: 403,
                      code: 4,
                      message: 'No more questions for this session. Please create a new session'
                   }))
                   .catch(() => next({
                      status: 403,
                      code: 4,
                      message: 'No more questions for this session. Please create a new session'
                   }));
            }
         })
         .catch(err => {
            logger.error(`Encountered error while fetching questions - ${err.message ? err.message : JSON.stringify(err)}`);
            if (err.response && err.response.status === 403) {
               next({status: 403});
            } else {
               next({status: 400, message: 'Encountered error while fetching questions'});
            }
         });
   });
});

module.exports = {
   path: '/quiz/api',
   router: router
};
