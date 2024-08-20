import { Router } from "express";
import { verifyJWT, verifyPermission } from "../middlewares/auth.middleware.js";
import { validate } from "../validators/validate.js";
import { createProduct } from "../controllers/product.controller.js";
import { UserRolesEnum } from "../constants.js";
import { createProductValidator } from "../validators/product.validator.js";
import { MAXIMUM_SUB_IMAGE_COUNT } from "../constants.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = Router();

router.route("/").post(
  verifyJWT,
  verifyPermission([UserRolesEnum.ADMIN]),
  // In product form we will received one main image file type
  // And max 4 sub images
  upload.fields([
    {
      name: "mainImage",
      maxCount: 1,
    },
    {
      // frontend will send at max 4 `subImages` keys with file object which we will save in the backend
      name: "subImages",
      maxCount: MAXIMUM_SUB_IMAGE_COUNT, // maximum number of subImages is 4
    },
  ]),
  createProductValidator(),
  validate,
  createProduct
);

export default router;
