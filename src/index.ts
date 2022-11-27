import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import { format } from 'date-fns';
import { AppDataSource } from './data-source';
import { Event } from './entity/Event';
import { Booking } from './entity/Booking';
import { validateSchema } from './middleware/validateSchema';

const app: Express = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(cors());

app.get('/health', (req: Request, res: Response) => {
  res.send('Server Running!');
});

app.get('/schedule', async (req: Request, res: Response) => {
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
});

app.post(
  '/schedule',
  validateSchema({ payloadType: 'body' }),
  async (req: Request, res: Response) => {
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
      return res.status(201).json({ message: 'Appointment Scheduled ' });
    } catch (err) {
      console.log(err);
    }
  },
);

app.use((err, req, res, next) => {
  console.error(err);
  const code = err?.code || 500;
  const name = err?.name || 'Something went wrong';
  const message = err?.message || 'Request failed';
  res.status(code).json({
    statusCode: code,
    name,
    message,
  });
});

app.listen(port, () => {
  console.log(`App listening on port ${port}`);
});
