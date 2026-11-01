// Standardized API response helpers — used by all controllers

const sendSuccess = (res, data = {}, message = 'Success', statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    data,
    message
  });
};

const sendError = (res, message = 'Something went wrong', statusCode = 500, error = null) => {
  const response = {
    success: false,
    data: null,
    message
  };
  if (error) {
    response.error = typeof error === 'string' ? { code: error } : error;
  }
  return res.status(statusCode).json(response);
};

module.exports = { sendSuccess, sendError };
