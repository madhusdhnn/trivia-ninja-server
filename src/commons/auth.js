module.exports = function (req, res, next) {
   const userId = req.headers['x-user-id'];
   if (!userId) {
      res.status(401).json({
         message: 'You are not authorized to access this service.'
      });
   } else {
      req.query.userId = userId;
      next();
   }
};
