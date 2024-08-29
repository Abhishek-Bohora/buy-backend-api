import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import mongoose from "mongoose";
import { EcomOrder } from "../models/order.model.js";
import { Cart } from "../models/cart.model.js";
import { getCart } from "../controllers/cart.controller.js";

const khaltiBaseUrl = {
  sandbox: "https://a.khalti.com/api/v2/",
  production: "https://khalti.com/api/v2/",
};

const generateKhaltiAccessToken = async () => {
  try {
    return process.env.KHALTI_LIVE_SECRET_KEY;
  } catch (error) {
    throw new ApiError(500, "Error while generating Khalti auth token");
  }
};

const khaltiApi = async (endpoint, body = {}) => {
  const accessToken = await generateKhaltiAccessToken();
  const url = `${khaltiBaseUrl.sandbox}${endpoint}`;
  console.log("Calling Khalti API:", url);
  const response = await fetch(`${khaltiBaseUrl.sandbox}${endpoint}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Key ${accessToken}`,
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("Khalti API error:", errorText);
    throw new Error(`Khalti API error: ${response.status} ${errorText}`);
  }

  return response;
};

const generateKhaltiOrder = asyncHandler(async (req, res) => {
  //TODO: ZOD VALIDATION
  const { addressLine1, addressLine2, district, city } = req.body;

  if (!addressLine1 || !district || !city) {
    throw new ApiError(
      400,
      "Missing required fields: addressLine1, district, and city are required." +
        error.message
    );
  }

  try {
    //finding the cart of the currently logged in user
    const cart = await Cart.findOne({
      owner: req.user._id,
    });

    if (!cart || !cart.items?.length) {
      throw new ApiError(400, "User cart is empty");
    }

    const orderItems = cart.items; // these items are used further to set product stock
    const userCart = await getCart(req.user._id);

    const totalPrice = userCart.cartTotal;

    // Initiate the Khalti payment request
    const response = await khaltiApi("epayment/initiate/", {
      return_url: "http://localhost:8080/api/v1/ecommerce/orders/payment",
      website_url: "http://localhost:8080/",
      amount: Math.round(totalPrice * 100), // amount in paisa
      purchase_order_id: "order-" + Date.now(),
      purchase_order_name: "Fake Order",
      customer_info: {
        name: req.user.username,
        email: req.user.email,
        phone: "9800000000",
      },
    });

    // Check if the response is OK
    if (!response.ok) {
      console.error("Khalti API error:", await response.text());
      throw new ApiError(response.status, "Error from Khalti API");
    }

    const khaltiOrder = await response.json();
    console.log("Khalti order response:", khaltiOrder);

    if (khaltiOrder?.pidx) {
      // Create an order while we generate Khalti session
      const unpaidOrder = await EcomOrder.create({
        address: {
          addressLine1: addressLine1,
          addressLine2: addressLine2,
          city: city,
          District: district,
        },
        customer: req.user._id,
        items: orderItems,
        orderPrice: totalPrice,
        discountedOrderPrice: 0,
        paymentProvider: "KHALTI",
        paymentId: khaltiOrder.pidx,
      });

      if (unpaidOrder) {
        return res
          .status(201)
          .json(
            new ApiResponse(
              201,
              { ...khaltiOrder, paymentUrl: khaltiOrder.payment_url },
              "Khalti order generated successfully"
            )
          );
      }
    } else {
      console.error("Unexpected Khalti response:", khaltiOrder);
      throw new ApiError(500, "Unexpected response from Khalti");
    }
  } catch (error) {
    console.error("Error in generateKhaltiOrder:", error);
    throw new ApiError(
      500,
      "Something went wrong while initializing the Khalti order: " +
        error.message
    );
  }
});

const verifyKhaltiPayment = asyncHandler(async (req, res) => {
  const { pidx, transaction_id, status, amount, purchase_order_id } =
    req.method === "GET" ? req.query : req.body;

  if (status !== "Completed") {
    throw new ApiError(400, "Payment was not completed");
  }

  // Verify the payment with Khalti
  const response = await khaltiApi("epayment/lookup/", {
    pidx,
  });

  const paymentStatus = await response.json();

  if (
    paymentStatus?.status === "Completed" &&
    paymentStatus.transaction_id === transaction_id
  ) {
    // Update your order status in the database
    const order = await EcomOrder.findOneAndUpdate(
      { paymentId: pidx },
      {
        status: "PAID",
        isPaymentDone: true,
        $set: { "paymentDetails.transactionId": transaction_id },
      },
      { new: true }
    );

    if (!order) {
      throw new ApiError(404, "Order not found");
    }

    // Redirect to a success page or send a success response
    return res.redirect("http://localhost:3000/product"); // You need to create this route/page
  } else {
    throw new ApiError(400, "Payment verification failed");
  }
});

export { generateKhaltiOrder, verifyKhaltiPayment };
