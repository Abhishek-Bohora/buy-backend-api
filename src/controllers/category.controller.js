import { ApiError } from "../../src/utils/ApiError.js";
import { ApiResponse } from "../../src/utils/ApiResponse.js";
import { getMongoosePaginationOptions } from "../utils/helpers.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Category } from "../models/category.model.js";

const getCategory = asyncHandler(async (req, res) => {
  const categories = await Category.find({});

  if (!categories) {
    return res
      .status(404)
      .json(new ApiResponse(404, null, "No categories found"));
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, categories, "Categories retrieved successfully")
    );
});

const createCategory = asyncHandler(async (req, res) => {
  const { name } = req.body;

  const category = await Category.create({ name, owner: req.user._id });

  return res
    .status(201)
    .json(new ApiResponse(200, category, "Category created successfully"));
});

export { getCategory, createCategory };
