/**
 * Response Status formatter middleware.
 *
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express `next()` function
 */

export const responseHandlerMiddleware = (req, res, next) => {
  const oldJson = res.json;
  const body = {
    status: res.statusCode,
    data: null,
    error: null,
  };
  res.json = (data) => {
    if (res.statusCode === 200) {
      body.data = data;
      body.error = undefined;
    } else {
      body.status = res.statusCode;
      body.data = undefined;
      body.error = data.error;
    }
    oldJson.call(res, body);
  };
  next();
};
