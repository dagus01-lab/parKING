import { Router } from 'express';
import { getAllParkingSpots } from '../controllers/parKINGControllerBoDB';

const router = Router();

router.post('/', getAllParkingSpots);

export default router;
