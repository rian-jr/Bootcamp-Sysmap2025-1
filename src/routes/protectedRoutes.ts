
import express from 'express';
import { authGuard } from '../middlewares/authGuard';

const router = express.Router();

router.get('/profile', authGuard, (req, res) => {
    res.json({ userId: req.userId });
});

export default router;