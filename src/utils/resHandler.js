export const sucessHandle = ({
  res,
  message = "sucess",
  status = 200,
  data = {},
}) => {
  return res.status(status).json({
    message,
    data,
  });
};
export const errorHandle = ({ message = "error", status = 400, data }) => {
  const error = new Error(message, {
    cause: {
      status: status,
      message: message,
    },
  });
  error.status = status;
  error.stack = data;

  return error;
};
