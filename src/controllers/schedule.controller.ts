import { format } from 'date-fns';
import { Request, Response } from 'express';
import { AppDataSource } from '../data-source';
import { Booking } from '../entity/Booking';
import { Event } from '../entity/Event';

export const getSchedule = async (req: Request, res: Response) => {
  try {
    const events = await AppDataSource.getRepository(Event)
      .createQueryBuilder('event')
      .leftJoinAndSelect('event.config', 'config')
      .getMany();
    const bookingData = await AppDataSource.getRepository(Booking)
      .createQueryBuilder('booking')
      .leftJoinAndSelect('booking.event', 'event')
      .where('booking.status = :status', { status: 'PENDING' })
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
    console.log(err);
  }
};

export const postSchedule = async (req: Request, res: Response) => {
  try {
    const { email, firstName, lastName, eventId, startTime } = req?.body;
    await AppDataSource.createQueryBuilder()
      .insert()
      .into(Booking)
      .values([
        {
          email,
          firstName,
          lastName,
          status: 'PENDING',
          startTime: format(new Date(startTime), 'y-MM-dd HH:mm:ss'),
          event: () => eventId,
        },
      ])
      .execute();
    return res.status(201).json({ message: 'Appointment Scheduled' });
  } catch (err) {
    console.log(err);
  }
};

module.exports = {
  getSchedule,
  postSchedule,
};
