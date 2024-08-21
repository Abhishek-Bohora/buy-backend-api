import { asyncHandler } from "../utils/asyncHandler.js";
import { Cart } from "../models/cart.model.js";
import { Product } from "../models/product.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

export const getCart = async (userId) => {
  const cartAggregation = await Cart.aggregate([
    {
      $match: {
        owner: userId,
      },
    },
    {
      $unwind: "$items",
    },
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
        items: {
          $push: {
            product: "$product",
            quantity: "$quantity",
          },
        },
        cartTotal: {
          $sum: {
            $multiply: ["$product.price", "$quantity"],
          },
        },
      },
    },
  ]);

  return (
    cartAggregation[0] ?? {
      _id: null,
      items: [],
      cartTotal: 0,
    }
  );
};

const addItemOrUpdateItemQuantity = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  const { quantity = 1 } = req.body;

  // fetching the user cart
  const cart = await Cart.findOne({
    owner: req.user._id,
  });

  // If the cart is null, create a new cart
  if (!cart) {
    const newCart = await Cart.create({
      owner: req.user._id,
      items: [
        {
          productId,
          quantity,
        },
      ],
    });
    const structuredCart = await getCart(req.user._id);
    return res
      .status(200)
      .json(new ApiResponse(200, structuredCart, "Item added successfully"));
  }

  // See if product that user is adding exist in the db
  const product = await Product.findById(productId);
  if (!product) {
    throw new ApiError(404, "Product does not exist");
  }

  // If product is there check if the quantity that user is adding is less than or equal to the product's stock
  if (quantity > product.stock) {
    // if quantity is greater throw an error
    throw new ApiError(
      400,
      product.stock > 0
        ? "Only " +
          product.stock +
          " products are remaining. But you are adding " +
          quantity
        : "Product is out of stock"
    );
  }

  // See if the product that user is adding already exists in the cart
  const addedProduct = cart.items?.find(
    (item) => item.productId.toString() === productId
  );
  if (addedProduct) {
    // If product already exist assign a new quantity to it
    // ! We are not adding or subtracting quantity to keep it dynamic. Frontend will send us updated quantity here
    addedProduct.quantity = quantity;
  } else {
    // if its a new product being added in the cart push it to the cart items
    cart.items.push({
      productId,
      quantity,
    });
  }

  await cart.save();
  const newCart = await getCart(req.user._id); // structure the user cart
  return res
    .status(200)
    .json(new ApiResponse(200, newCart, "Item added successfully"));
});

export { addItemOrUpdateItemQuantity };
