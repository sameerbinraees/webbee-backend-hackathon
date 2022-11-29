import { Request, Response, NextFunction } from 'express';
import {
  addBooking,
  getAllEventsWithConfig,
  getBookings,
  transformBookingDetails,
  updateBookings,
  validatePostScheduleRequest,
} from '../services/schedule.service';
import { BOOKING_STATUS } from '../utils/constants';

export const getSchedule = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const events = await getAllEventsWithConfig();
    const bookingData = await getBookings(BOOKING_STATUS.PENDING);
    const bookings = transformBookingDetails(bookingData);

    const result = { events, bookings };
    return res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};

export const postSchedule = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { eventId, startTime } = req?.body;
    await validatePostScheduleRequest(eventId, startTime);

    await updateBookings(BOOKING_STATUS.COMPLETED);
    await addBooking(req?.body);
    return res.status(201).json({ message: 'Appointment Scheduled' });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getSchedule,
  postSchedule,
};
