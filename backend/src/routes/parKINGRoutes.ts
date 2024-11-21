import { Router } from 'express';
import { getAllParkingSpots } from '../controllers/parKINGControllerMock';

const router = Router();

router.post('/', getAllParkingSpots);

export default router;
