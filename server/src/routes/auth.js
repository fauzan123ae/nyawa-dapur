import { Router } from 'express'
import { register, login, logout, me, updateProfile, changePassword } from '../controllers/authController.js'
import { authenticate } from '../middleware/auth.js'

const router = Router()
router.post('/register',        register)
router.post('/login',           login)
router.post('/logout',          authenticate, logout)
router.get('/me',               authenticate, me)
router.patch('/profile',        authenticate, updateProfile)
router.post('/change-password', authenticate, changePassword)

export default router