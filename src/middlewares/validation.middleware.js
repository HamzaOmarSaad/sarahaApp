const dataInputTypes = ["body", "params", "query"];

export const validateMiddleware = (schema) => {
  return (req, res, next) => {
    const validationErrors = [];

    dataInputTypes.forEach((type) => {
      if (!schema[type]) return;

      const { error } = schema[type].validate(req[type], {
        abortEarly: false,
      });

      if (error) {
        validationErrors.push({
          [type]: error.details.map((err) => err.message),
        });
      }
    });

    if (validationErrors.length > 0) {
      const err = new Error("Validation Error");
      err.status = 400;
      err.validationErrors = validationErrors;
      return next(err);
    }

    next();
  };
};
