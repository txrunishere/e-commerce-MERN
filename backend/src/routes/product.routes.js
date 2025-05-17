import { Router } from 'express'
const router = Router()
import { handleUploadProduct } from '../controllers/product.controller.js'
import { verifyAuth } from '../middlewares/auth.middleware.js'
import { upload } from '../middlewares/multer.middleware.js'

router.use(verifyAuth)

router.route('/add-product').post(
  upload.single('productImage'),
  handleUploadProduct
)

export default router