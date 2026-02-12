export const findOneDoc = async ({
  model,
  filter,
  select = "",
  options = {},
}) => {
  const query = model.findOne(filter).select(select);
  if (options.populate) {
    query.populate(options.populate);
  }
  if (options.lean) {
    query.lean();
  }

  const doc = await query;
  return doc;
};
export const findAllDocs = async ({
  model,
  filter = {},
  select = "",
  options = {},
}) => {
  const query = model.find(filter).select(select);
  if (options.populate) {
    query.populate(options.populate);
  }
  if (options.lean) {
    query.lean();
  }

  const doc = await query;
  return doc;
};
export const createDoc = async ({
  model,
  data,
  options = { ValidateBeforeSave: true },
}) => {
  const docs = await model.create(Array.isArray(data) ? data : [data], options);
  return Array.isArray(data) ? docs : docs[0];
};
