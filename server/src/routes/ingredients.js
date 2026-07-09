import { Router } from 'express'
import { store, update, adjust, cook, waste, destroy } from '../controllers/ingredientController.js'
import { authenticate } from '../middleware/auth.js'

const router = Router()
router.use(authenticate)
router.post('/',          store)
router.put('/:id',        update)
router.put('/:id/adjust', adjust)
router.post('/:id/cook',  cook)
router.post('/:id/waste', waste)
router.delete('/:id',     destroy)
export default router
