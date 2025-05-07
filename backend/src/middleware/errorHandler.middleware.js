import { ApiError } from "../utils/api-error.js";


const errorHandler = (err, req, res, next) => {
  if (err instanceof ApiError) {
    res.status(err.statusCode).json({
      success: false,
      message: err.message,
      errors: err.errors,
    });
  } else {
    res.status(500).json({
      success: false,
      message: err.message,
      errors: [],
    });
  }
};

export{ errorHandler };
