import { format } from 'date-fns';
import { Request, Response, NextFunction } from 'express';
import { AppDataSource } from '../data-source';
import { Booking } from '../entity/Booking';
import { Event } from '../entity/Event';
import { validatePostScheduleRequest } from '../utils/helpers';

const BOOKING_STATUS = {
  PENDING: 'PENDING',
  COMPLETED: 'COMPLETED',
};

export const getSchedule = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const events = await AppDataSource.getRepository(Event)
      .createQueryBuilder('event')
      .leftJoinAndSelect('event.config', 'config')
      .getMany();
    const bookingData = await AppDataSource.getRepository(Booking)
      .createQueryBuilder('booking')
      .leftJoinAndSelect('booking.event', 'event')
      .where('booking.status = :status', { status: BOOKING_STATUS.PENDING })
      .getMany();
    const bookings = {};
    if (bookingData?.length) {
      // Format booked slots details
      bookingData.forEach((booking) => {
        const date = format(new Date(booking?.startTime), 'y-MM-dd');
        const time = format(new Date(booking?.startTime), 'HH:mm');
        if (!bookings[date]) bookings[date] = {};
        if (!bookings[date][time]) bookings[date][time] = {};
        if (!bookings[date][time][`event_${booking?.event?.id}`])
          bookings[date][time][`event_${booking?.event?.id}`] = 1;
        else bookings[date][time][`event_${booking?.event?.id}`] += 1;
      });
    }
    const result = { events, bookings };
    return res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};

export const postSchedule = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, firstName, lastName, eventId, startTime } = req?.body;
    validatePostScheduleRequest();

    //* All the previous bookings from 'current date time' will be updated to 'COMPLETED' to reduce the clutter
    await AppDataSource.createQueryBuilder()
      .update(Booking)
      .set({ status: BOOKING_STATUS.COMPLETED })
      .where('Booking.startTime < :currentTime', { currentTime: new Date() })
      .execute();

    await AppDataSource.createQueryBuilder()
      .insert()
      .into(Booking)
      .values([
        {
          email,
          firstName,
          lastName,
          status: BOOKING_STATUS.PENDING,
          startTime: format(new Date(startTime), 'y-MM-dd HH:mm:ss'),
          event: () => eventId,
        },
      ])
      .execute();
    return res.status(201).json({ message: 'Appointment Scheduled' });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getSchedule,
  postSchedule,
};
