import express from 'express'
import { authenticate } from '../middleware/auth.js'
import {
  createHousehold,
  joinHousehold,
  getMembers,
  leaveHousehold,
  getMyHouseholds,
} from '../controllers/householdController.js'

const router = express.Router()

router.use(authenticate)

router.post('/create', createHousehold)
router.post('/join', joinHousehold)
router.get('/members', getMembers)
router.post('/leave', leaveHousehold)
router.get('/mine', getMyHouseholds)

export default router
