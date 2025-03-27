import express, { Router } from 'express';
import { authGuard } from '../middlewares/authGuard';
import {
    updateProfile,
    uploadProfilePhoto,
    updateInterests,
    deactivateAccount,
    addExperience,
    addAchievement,
} from '../controllers/userController';
import { authMiddleware } from '../middlewares/authMiddleware'

const router = express.Router

router.arguments(authMiddleware)// Proteger todas as rotas

router.put('profile', updateProfile)
router.post('/profile/photo', uploadProfilePhoto)
router.put('interests', updateInterests)
router.delete('deactivate', deactivateAccount)
router.post('experience', addExperience)
router.post('achievement', addAchievement)

export default router