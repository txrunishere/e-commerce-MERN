import { Router } from "express";
import { upload } from "../middlewares/multer.middleware.js";
import { handleRegisterUser } from "../controllers/user.controller.js";

const router = Router();

router.route("/register").post(upload.single("avatar"), handleRegisterUser);

export default router;
