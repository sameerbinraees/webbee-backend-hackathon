import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import scheduleRouter from './routes/schedule.route';
import { handleError } from './utils/error';

const app: Express = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(cors());

app.get('/health', (req: Request, res: Response) => {
  res.send('Server Running!');
});

app.use('/schedule', scheduleRouter);

app.use((err, req, res, next) => {
  handleError(err, res);
});

app.listen(port, () => {
  console.log(`App listening on port ${port}`);
});
