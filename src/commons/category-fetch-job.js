const cron = require('node-cron');
const log4js = require('log4js');
const {enableLogging} = require("./utils");
const logger = enableLogging(log4js.getLogger('CategoryFetchJob'));
const axios = require('axios');
const {domain} = require('./utils');

const fs = require('fs');
const path = require('path');

const formatCategories = ({trivia_categories}) => {
   if (!trivia_categories) throw new Error('Quiz categories not present');

   const categories = [];

   trivia_categories.forEach(category => {
      const {id, name} = category;
      const isGroup = name.includes(':');
      if (isGroup) {
         const d = name.split(':');
         const subCategory = {id: id, title: d[1].trim()};
         const cty = categories.find(ct => ct.isGroup && ct.title === d[0]);
         if (!cty) {
            categories.push({
               isGroup: true,
               title: d[0],
               subCategories: [subCategory]
            })
         } else {
            cty.subCategories.push(subCategory);
            const index = categories.indexOf(cty);
            if (index !== -1) categories.splice(index, 1);
            categories.push(cty);
         }
      } else {
         categories.push({
            id: id,
            isGroup: false,
            title: name
         })
      }
   });
   return {categories: categories};
}

const writeToFile = (data, filePath) => {
   return new Promise(function (resolve, reject) {
      try {
         if (!data || !filePath) {
            reject(new Error(`Params for writeToFile are mandatory`));
         } else {
            fs.writeFileSync(filePath, JSON.stringify(data));
            resolve('File write success');
         }
      } catch (err) {
         reject(err);
      }
   });
};

const scheduler = () => {
   logger.info(`Starting job to fetch quiz categories`);
   axios.get(`${domain}/api_category.php`)
      .then(response => {
         writeToFile(formatCategories(response.data), path.join(__dirname, '../', '../', 'data', 'categories.json'))
            .then(() => logger.info("Completed fetch quiz categories job"))
            .catch(e => logger.error(`Failed to write quiz categories data to the file. ${e}`));
      })
      .catch(err => logger.error(`Error while trying to fetch quiz categories - ${err}`));
};


/* Run job at 12.30 AM every day */
const categoriesFetchTask = cron.schedule('0 30 0 1/1 * *', scheduler, {scheduled: false});

module.exports = categoriesFetchTask;
