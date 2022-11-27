import Joi from 'joi';
export const validateSchema = (params) => {
  return function (req, res, next) {
    const { payloadType } = params;
    const payload = req[payloadType] || {};
    const result = Joi.object({
      firstName: Joi.string().min(3).max(30).required(),
      lastName: Joi.string().min(3).max(30).required(),
      email: Joi.string().email().required(),
      eventId: Joi.number().positive().required(),
      startTime: Joi.date()
        .iso()
        .error(new Error('From date must be in ISO 8601 format'))
        .required(),
    }).validate(payload);
    if (result?.error)
      return next({ name: 'Validation Error', code: 400, message: result?.error?.message });
    return next();
  };
};
