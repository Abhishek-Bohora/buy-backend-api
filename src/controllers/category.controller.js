import { ApiError } from "../../src/utils/ApiError.js";
import { ApiResponse } from "../../src/utils/ApiResponse.js";
import { getMongoosePaginationOptions } from "../utils/helpers.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Category } from "../models/category.model.js";

const createCategory = asyncHandler(async (req, res) => {
  const { name } = req.body;

  const category = await Category.create({ name, owner: req.user._id });

  return res
    .status(201)
    .json(new ApiResponse(200, category, "Category created successfully"));
});

export { createCategory };
