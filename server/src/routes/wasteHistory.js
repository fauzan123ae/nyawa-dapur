import { Router } from 'express'
import { authenticate } from '../middleware/auth.js'
import { getWasteHistory, deleteWasteHistory } from '../controllers/wasteHistoryController.js'

const router = Router()
router.get('/',      authenticate, getWasteHistory)
router.delete('/:id', authenticate, deleteWasteHistory)
export default router