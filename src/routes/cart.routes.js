import { Router } from "express";
import { validate } from "../validators/validate.js";
import { mongoIdPathVariableValidator } from "../common/mongodb.validators.js";
import { addItemOrUpdateItemQuantityValidator } from "../validators/cart.validator.js";
import {
  addItemOrUpdateItemQuantity,
  getUserCart,
  deleteItemFromCart,
} from "../controllers/cart.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.use(verifyJWT);
router.route("/").get(getUserCart);

router
  .route("/item/:productId")
  .post(
    mongoIdPathVariableValidator("productId"),
    addItemOrUpdateItemQuantityValidator(),
    validate,
    addItemOrUpdateItemQuantity
  )
  .delete(
    mongoIdPathVariableValidator("productId"),
    validate,
    deleteItemFromCart
  );

export default router;
