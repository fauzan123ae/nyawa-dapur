import { Router } from 'express'
import { getDashboard, buyFirewood, igniteWood, nextDay } from '../controllers/dashboardController.js'
import { authenticate } from '../middleware/auth.js'

const router = Router()
router.use(authenticate)
router.get('/',                      getDashboard)
router.post('/shop/buy-firewood',    buyFirewood)
router.post('/kitchen/ignite-wood',  igniteWood)
router.post('/simulation/next-day',  nextDay)
export default router
