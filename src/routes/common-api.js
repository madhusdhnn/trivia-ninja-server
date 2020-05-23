const express = require('express');
const router = express.Router();
const {categoriesFilePath, withFile} = require('../commons/utils');
const path = require('path');

router.get('/categories', (req, res, next) => {
   try {
      withFile(path.join(__dirname, '../', '../', categoriesFilePath), categories => {
         res.json(JSON.parse(categories));
      });
   } catch (err) {
      next({
         status: 400,
         message: (err.code === 'ENOENT') ? 'Error while fetching categories' : 'Something went wrong'
      });
   }
});

module.exports = {
   path: '/quiz/common',
   router: router
}
