import { Router } from 'express'
import { index, store, update, adjust, cook, cookAmount, cookBatch, waste, destroy } from '../controllers/ingredientController.js'
import { authenticate } from '../middleware/auth.js'

const router = Router()
router.use(authenticate)
router.get('/',                index)
router.post('/',               store)
router.post('/cook-batch',     cookBatch)
router.put('/:id',             update)
router.put('/:id/adjust',      adjust)
router.post('/:id/cook',       cook)
router.post('/:id/cook-amount', cookAmount)
router.patch('/:id/waste',      waste)
router.delete('/:id',          destroy)
export default router