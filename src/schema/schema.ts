import Joi from 'joi';

export const SchedulePostSchema = {
  body: Joi.object({
    firstName: Joi.string().min(3).max(30).required(),
    lastName: Joi.string().min(3).max(30).required(),
    email: Joi.string().email().required(),
    eventId: Joi.string().required(),
    startTime: Joi.date().iso().error(new Error('From date must be in ISO 8601 format')).required(),
  }),
};
