import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import scheduleRouter from './routes/schedule.route';

const app: Express = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(cors());

app.get('/health', (req: Request, res: Response) => {
  res.send('Server Running!');
});

app.use('/schedule', scheduleRouter);

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
