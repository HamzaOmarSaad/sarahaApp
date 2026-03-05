import fs from "fs/promises";

const dataInputTypes = ["body", "params", "query", "file", "files"];

export const validateMiddleware = (schema) => {
  return async (req, res, next) => {
    const validationErrors = [];

    for (const type of dataInputTypes) {
      if (!schema[type]) continue;

      const { error, value } = schema[type].validate(req[type], {
        abortEarly: false,
        stripUnknown: true,
      });

      if (error) {
        validationErrors.push({
          [type]: error.details.map((err) => ({
            message: err.message,
            field: err.path.join("."),
          })),
        });
      } else {
        req[type] = value; // sanitized
      }
    }

    if (validationErrors.length > 0) {
      if (req.file) {
        await fs.unlink(req.file.finalPath).catch(() => {});
      }
      if (req.files) {
        const files = Array.isArray(req.files)
          ? req.files
          : Object.values(req.files).flat();

        files.forEach(
          async (file) => await fs.unlink(file.path).catch(() => {}),
        );
      }
      const err = new Error("Validation Error");
      err.status = 400;
      err.validationErrors = validationErrors;
      return next(err);
    }

    next();
  };
};
