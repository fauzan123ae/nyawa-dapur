import { Router } from 'express'
import { authenticate } from '../middleware/auth.js'
import { getCookingHistory, deleteHistoryEntry, clearAllHistory } from '../controllers/historyController.js'

const router = Router()

router.use(authenticate)

router.get('/', getCookingHistory)
router.delete('/clear', clearAllHistory)
router.delete('/:id', deleteHistoryEntry)

export default router   