module.exports = app => {
  app.config.coreMiddleware.unshift('tokenVerify');
};
