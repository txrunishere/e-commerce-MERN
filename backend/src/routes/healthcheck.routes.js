import { Router } from 'express'
import { handleHealthcheck } from '../controllers/healthcheck.controller.js'

const router = Router()

router.route('/').get(handleHealthcheck)

export default router