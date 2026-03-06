import { Router } from 'express';
import {
    getProfile, updateProfile, getAddresses, addAddress, deleteAddress,
} from '../controllers/userController';

const router = Router();

router.get('/profile', getProfile);
router.put('/profile', updateProfile);
router.get('/addresses', getAddresses);
router.post('/addresses', addAddress);
router.delete('/addresses/:id', deleteAddress);

export default router;
