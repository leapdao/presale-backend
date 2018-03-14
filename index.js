import AWS from 'aws-sdk';
import Raven from 'raven';
import Backend from './src/index';
import Db from './src/db';
import Logger from './src/logger';

const handleError = function handleError(err, logger, callback) {
  logger.exception(err).then(callback);
};

exports.handler = function handler(event, context, callback) {
  Raven.config(process.env.SENTRY_URL).install();

  const db = new Db(
    new AWS.SimpleDB(),
    process.env.TABLE_NAME
  );
  const logger = new Logger(Raven, context.functionName, 'presale-backend');
  const backend = new Backend(db, logger);

  const getRequestHandler = () => {
    const path = event.context['resource-path'];
    if (path.indexOf('submit') > -1) {
      return backend.claimPromoCode(
        event.promoCode,
        event.email,
      );
    }

    return Promise.reject(`Not Found: unexpected path: ${path}`);
  };

  try {
    getRequestHandler()
      .then(data => callback(null, data))
      .catch(err => handleError(err, logger, callback));
  } catch (err) {
    handleError(err, logger, callback);
  }
};
