import { format } from 'date-fns';

import { AppDataSource } from '../data-source';
import { Booking } from '../entity/Booking';
import { Config } from '../entity/Config';
import { Event } from '../entity/Event';
import { BOOKING_STATUS } from '../utils/constants';
import { ErrorHandler } from '../utils/error';

export const getAllEventsWithConfig = async () => {
  return await AppDataSource.getRepository(Event)
    .createQueryBuilder('event')
    .leftJoinAndSelect('event.config', 'config')
    .getMany();
};

export const getBookings = async (status) => {
  return await AppDataSource.getRepository(Booking)
    .createQueryBuilder('booking')
    .leftJoinAndSelect('booking.event', 'event')
    .where('booking.status = :status', { status })
    .getMany();
};

export const transformBookingDetails = (bookingData) => {
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
  return bookings;
};

export const updateBookings = async (status) => {
  //* All the previous bookings from 'current date time' will be updated to 'COMPLETED' to reduce the clutter
  await AppDataSource.createQueryBuilder()
    .update(Booking)
    .set({ status })
    .where('booking."startTime" < :currentTime', { currentTime: new Date() })
    .execute();
};

export const addBooking = async (args) => {
  const { email, firstName, lastName, eventId, startTime } = args;

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
};

export const validatePostScheduleRequest = async (eventId, bookingTime) => {
  // shop is open and not in any break:
  const day = new Date(bookingTime).getDay();
  if (day === 7) throw new ErrorHandler('BAD_REQUEST', 'Shop is closed at the requested time', 400);

  const [config] = await AppDataSource.getRepository(Config)
    .createQueryBuilder('config')
    .where('config."eventId" = :eventId', { eventId })
    .andWhere('config."dayOfWeek" = :dayOfWeek', { dayOfWeek: `${day}` })
    .getMany();
  console.log(config);
  const requestTimeInMilliseconds = new Date(bookingTime).getTime();
  const requestHour = new Date(bookingTime).getHours();
  const openingHour = new Date(config?.openingTime).getHours();
  const closingHour = new Date(config?.closingTime).getHours();
  if (requestHour < openingHour || requestHour > closingHour)
    throw new ErrorHandler('BAD_REQUEST', 'Shop is closed at the requested time', 400);
  // not between any work breaks
  config?.workBreaks?.forEach((breakTime) => {
    const [breakStart, breakEnd] = breakTime.split(' -- ');
    const breakStartInMilliseconds = new Date(
      new Date(bookingTime).getFullYear(),
      new Date(bookingTime).getMonth(),
      new Date(bookingTime).getDate(),
      new Date(breakStart).getHours(),
      new Date(breakStart).getMinutes(),
      new Date(breakStart).getSeconds(),
    ).getTime();
    const breakEndInMilliseconds = new Date(
      new Date(bookingTime).getFullYear(),
      new Date(bookingTime).getMonth(),
      new Date(bookingTime).getDate(),
      new Date(breakEnd).getHours(),
      new Date(breakEnd).getMinutes(),
      new Date(breakEnd).getSeconds(),
    ).getTime();
    if (
      requestTimeInMilliseconds >= breakStartInMilliseconds &&
      requestTimeInMilliseconds < breakEndInMilliseconds
    )
      throw new ErrorHandler(
        'BAD_REQUEST',
        'Employees are on the break at the requested time',
        400,
      );
  });

  // Not in any booked time
  const bookingData = await getBookings(BOOKING_STATUS.PENDING);
  const bookings = transformBookingDetails(bookingData);
  const requestDate = format(new Date(bookingTime), 'y-MM-dd');
  const requestTime = format(new Date(bookingTime), 'HH:mm');
  const alreadyBookedSlots = bookings?.[requestDate]?.[requestTime][`event_${eventId}`] || 0;
  if (config?.totalClientsPerSlot - alreadyBookedSlots >= 0)
    throw new ErrorHandler(
      'BAD_REQUEST',
      'All slots are already booked at the requested time',
      400,
    );
};
