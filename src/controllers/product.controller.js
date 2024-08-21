import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../../src/utils/ApiError.js";
import { ApiResponse } from "../../src/utils/ApiResponse.js";
import { Category } from "../models/category.model.js";
import { getStaticFilePath, getLocalPath } from "../utils/helpers.js";
import { Product } from "../models/product.model.js";
import { getMongoosePaginationOptions } from "../utils/helpers.js";

// only admin
const createProduct = asyncHandler(async (req, res) => {
  const { name, description, category, price, stock } = req.body;

  const categoryToBeAdded = await Category.findById(category);

  if (!categoryToBeAdded) {
    throw new ApiError(404, "Category does not exist");
  }

  // Check if user has uploaded a main image
  if (!req.files?.mainImage || !req.files?.mainImage.length) {
    throw new ApiError(400, "Main image is required");
  }

  const mainImageUrl = getStaticFilePath(
    req,
    req.files?.mainImage[0]?.filename
  );
  const mainImageLocalPath = getLocalPath(req.files?.mainImage[0]?.filename);

  // Check if user has uploaded any subImages if yes then extract the file path
  // else assign an empty array
  /**
   * @type {{ url: string; localPath: string; }[]}
   */
  const subImages =
    req.files.subImages && req.files.subImages?.length
      ? req.files.subImages.map((image) => {
          const imageUrl = getStaticFilePath(req, image.filename);
          const imageLocalPath = getLocalPath(image.filename);
          return { url: imageUrl, localPath: imageLocalPath };
        })
      : [];

  const owner = req.user._id;

  const product = await Product.create({
    name,
    description,
    stock,
    price,
    owner,
    mainImage: {
      url: mainImageUrl,
      localPath: mainImageLocalPath,
    },
    subImages,
    category,
  });
  return res
    .status(201)
    .json(new ApiResponse(201, product, "Product created successfully"));
});

// all users
const getAllProducts = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  const productAggregate = Product.aggregate([{ $match: {} }]);

  const products = await Product.aggregatePaginate(
    productAggregate,
    getMongoosePaginationOptions({
      page,
      limit,
      customLabels: {
        totalDocs: "totalProducts",
        docs: "products",
      },
    })
  );

  return res
    .status(200)
    .json(new ApiResponse(200, products, "Products fetched successfully"));
});
export { createProduct, getAllProducts };
