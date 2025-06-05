export const asyncHandler = (requestHandler) => {
  return function (req, res, next) {
    Promise.resolve(requestHandler(req, res, next)).catch((error) => {
      console.log(error)
      next(error);
    });
  };
};
