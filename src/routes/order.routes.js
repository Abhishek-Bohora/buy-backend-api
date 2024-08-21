import { Router } from "express";
const router = Router();
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { validate } from "../validators/validate.js";
import { generateKhaltiOrder } from "../controllers/order.controller.js";
import { verifyKhaltiPayment } from "../controllers/order.controller.js";

// router.use(verifyJWT);
router.route("/provider/khalti").post(validate, verifyJWT, generateKhaltiOrder);
router
  .route("/provider/khalti/verify-payment")
  .post(validate, verifyJWT, verifyKhaltiPayment);

router.route("/payment").get(verifyKhaltiPayment);

export default router;
