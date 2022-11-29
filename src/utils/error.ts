export class ErrorHandler extends Error {
  statusCode: number;
  name: string;
  constructor(name, message, statusCode) {
    super();
    this.statusCode = statusCode;
    this.message = message;
    this.name = name;
  }
}
export const handleError = (err, res) => {
  console.error(err);
  const { statusCode = 500, message = 'Request failed', name = 'Something went wrong' } = err;

  return res.status(statusCode).json({
    name,
    statusCode,
    message,
  });
};
