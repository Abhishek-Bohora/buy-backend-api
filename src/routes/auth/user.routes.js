import { Router } from "express";
import {
  userRegisterValidator,
  userLoginValidator,
} from "../../validators/auth/user.validators.js";
import {
  registerUser,
  loginUser,
} from "../../controllers/auth/user.controller.js";
import { validate } from "../../validators/validate.js";
const router = Router();
//unsecured routes

router.route("/register").post(userRegisterValidator(), validate, registerUser);
router.route("/login").post(userLoginValidator(), validate, loginUser);

export default router;
