import express from 'express';
import { getSchedule, postSchedule } from '../controllers/schedule.controller';
import { validateSchema } from '../middleware/validateSchema';
const router = express.Router();

router.get('/', getSchedule);
router.post('/', validateSchema({ payloadType: 'body' }), postSchedule);

export default router;
