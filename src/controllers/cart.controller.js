import { asyncHandler } from "../utils/asyncHandler.js";
import { Cart } from "../models/cart.model.js";
import { Product } from "../models/product.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

export const getCart = async (userId) => {
  const cartAggregation = await Cart.aggregate([
    { $match: { owner: userId } },
    { $unwind: "$items" },
    {
      $lookup: {
        from: "products",
        localField: "items.productId",
        foreignField: "_id",
        as: "product",
      },
    },
    {
      $project: {
        product: { $first: "$product" },
        quantity: "$items.quantity",
      },
    },
    {
      $group: {
        _id: "$_id",
        items: { $push: { product: "$product", quantity: "$quantity" } },
        cartTotal: { $sum: { $multiply: ["$product.price", "$quantity"] } },
      },
    },
  ]);

  return cartAggregation[0] ?? { _id: null, items: [], cartTotal: 0 };
};

const getUserCart = asyncHandler(async (req, res) => {
  let cart = await getCart(req.user._id);
  return res
    .status(200)
    .json(new ApiResponse(200, cart, "Cart fetched successfully"));
});

const addItemOrUpdateItemQuantity = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  const { quantity = 1 } = req.body;

  // Fetching the user cart
  let cart = await Cart.findOne({ owner: req.user._id });

  // Fetch the product from the database
  const product = await Product.findById(productId);

  // If the product does not exist, throw an error
  if (!product) {
    throw new ApiError(404, "Product does not exist");
  }

  // If the product is out of stock, throw an error
  if (product.stock === 0) {
    throw new ApiError(400, "Product is out of stock");
  }

  // If the requested quantity is greater than the available stock, throw an error
  if (quantity > product.stock) {
    throw new ApiError(
      400,
      `Only ${product.stock} products are remaining. But you are adding ${quantity}`
    );
  }

  // If the cart is null, create a new cart
  if (!cart) {
    cart = await Cart.create({
      owner: req.user._id,
      items: [{ productId, quantity }],
    });
  } else {
    // See if the product that user is adding already exists in the cart
    const addedProduct = cart.items.find(
      (item) => item.productId.toString() === productId
    );

    if (addedProduct) {
      // if product already exists we just update the quantity, quantity comes from frontend
      addedProduct.quantity = quantity;
    } else {
      // If it's a new product being added to the cart, push it to the cart items
      cart.items.push({ productId, quantity });
    }

    await cart.save({ validateBeforeSave: true });
  }

  const newCart = await getCart(req.user._id);

  return res
    .status(200)
    .json(new ApiResponse(200, newCart, "Item added successfully"));
});

export { addItemOrUpdateItemQuantity, getUserCart };
