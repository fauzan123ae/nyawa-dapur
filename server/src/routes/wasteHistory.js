import { Router } from 'express'
import { authenticate } from '../middleware/auth.js'
import { getWasteHistory, deleteWasteHistory } from '../controllers/Wastehistorycontroller .js'

const router = Router()
router.get('/',      authenticate, getWasteHistory)
router.delete('/:id', authenticate, deleteWasteHistory)
export default router