import { Router } from 'express';
import { getAllParkingSpots } from '../controllers/parKINGController';

const router = Router();

router.get('/', getAllParkingSpots);

export default router;
