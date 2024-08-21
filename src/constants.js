export const UserRolesEnum = {
  ADMIN: "ADMIN",
  USER: "USER",
};
export const UserLoginType = {
  GOOGLE: "GOOGLE",
  EMAIL_PASSWORD: "EMAIL_PASSWORD",
};

export const AvailableUserRoles = Object.values(UserRolesEnum);

export const DB_NAME = "gadget-buy";
export const MAXIMUM_SUB_IMAGE_COUNT = 4;

// we can add payment provider later
export const PaymentProviderEnum = {
  UNKNOWN: "UNKNOWN",
  KHALTI: "KHALTI",
};

export const AvailablePaymentProviders = Object.values(PaymentProviderEnum);

export const OrderStatusEnum = {
  PENDING: "PENDING",
  CANCELLED: "CANCELLED",
  DELIVERED: "DELIVERED",
};

export const AvailableOrderStatuses = Object.values(OrderStatusEnum);
