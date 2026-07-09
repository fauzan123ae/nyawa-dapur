import { Router } from 'express'
import { claimQuest } from '../controllers/questController.js'
import { authenticate } from '../middleware/auth.js'

const router = Router()
router.use(authenticate)
router.post('/claim/:type', claimQuest)
export default router
