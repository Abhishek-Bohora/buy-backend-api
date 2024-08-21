import mongoose, { Schema } from "mongoose";
import {
  AvailablePaymentProviders,
  OrderStatusEnum,
  AvailableOrderStatuses,
  PaymentProviderEnum,
} from "../constants.js";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const orderSchema = new Schema(
  {
    orderPrice: {
      type: Number,
      required: true,
    },
    discountedOrderPrice: {
      type: Number,
      required: true,
    },
    customer: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    items: {
      type: [
        {
          productId: {
            type: Schema.Types.ObjectId,
            ref: "Product",
          },
          quantity: {
            type: Number,
            required: true,
            min: [1, "Quantity can not be less then 1."],
            default: 1,
          },
        },
      ],
      default: [],
    },
    address: {
      addressLine1: {
        required: true,
        type: String,
      },
      addressLine2: {
        type: String,
      },
      District: {
        required: true,
        type: String,
      },
      city: {
        required: true,
        type: String,
      },
    },
    status: {
      type: String,
      enum: AvailableOrderStatuses,
      default: OrderStatusEnum.PENDING,
    },
    paymentProvider: {
      type: String,
      enum: AvailablePaymentProviders,
      default: PaymentProviderEnum.UNKNOWN,
    },
    paymentId: {
      type: String,
    },
    // This field shows if the payment is done or not
    isPaymentDone: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

orderSchema.plugin(mongooseAggregatePaginate);

export const EcomOrder = mongoose.model("EcomOrder", orderSchema);
