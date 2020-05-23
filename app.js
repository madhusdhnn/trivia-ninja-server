const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const categoryFetchTask = require('./src/commons/category-fetch-job');

const globalErrorHandlerMiddleware = function (err, req, res, next) {
   res.status(err.status || 500)
      .json({code: err.code || -1, error: err.message ? err.message : 'Something went wrong'});
};

const createApp = function (routers = []) {
   const app = express();
   app.use(cors());
   app.use(bodyParser.json());
   app.use(bodyParser.urlencoded({extended: true}));
   if (routers.length > 0) {
      routers.forEach(router => app.use(router.path, router.router));
   }
   app.use(globalErrorHandlerMiddleware);
   return app;
}

const app = createApp([
   require('./src/routes/auth-api'),
   require('./src/routes/quiz-api'),
   require('./src/routes/common-api')
]);

const port = process.env.PORT || 5000;

categoryFetchTask.start();

const server = app.listen(port, () => console.log(`Server is up and running on port ${port}`));
server.setTimeout(20 * 60 * 1000);

const shutdownJob = () => categoryFetchTask.stop();

process.on("SIGINT", shutdownJob);
process.on("SIGTERM", shutdownJob);
