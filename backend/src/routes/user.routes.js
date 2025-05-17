import { Router } from "express";
import { upload } from "../middlewares/multer.middleware.js";
import { handleRegisterUser, handleLoginUser, handleGetUser, handleLogoutUser } from "../controllers/user.controller.js";
import { verifyAuth } from '../middlewares/auth.middleware.js'

const router = Router();

router.route("/register").post(upload.single("avatar"), handleRegisterUser);
router.route("/login").post(handleLoginUser)

router.route("/").get(verifyAuth, handleGetUser)

router.route("/logout").post(verifyAuth, handleLogoutUser)

export default router;
