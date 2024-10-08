import { Router } from "express";
import { verifyJWT, verifyPermission } from "../middlewares/auth.middleware.js";
import { categoryRequestBodyValidator } from "../validators/category.validator.js";
import { validate } from "../validators/validate.js";
import {
  getCategory,
  createCategory,
} from "../controllers/category.controller.js";
import { UserRolesEnum } from "../constants.js";

const router = Router();

router
  .route("/")
  .get(getCategory)
  .post(
    verifyJWT,
    verifyPermission([UserRolesEnum.ADMIN]),
    categoryRequestBodyValidator(),
    validate,
    createCategory
  );

export default router;
