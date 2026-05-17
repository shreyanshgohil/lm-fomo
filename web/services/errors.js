export class OrdersAccessError extends Error {
  constructor(message, options = {}) {
    super(message, options);
    this.name = "OrdersAccessError";
  }
}

export function isOrdersAccessError(error) {
  return (
    error instanceof OrdersAccessError ||
    error?.name === "OrdersAccessError" ||
    error?.isOrdersAccessError === true
  );
}

export function isForbiddenError(error) {
  const status = error?.response?.code ?? error?.response?.status;
  if (status === 403) {
    return true;
  }

  const message = (error?.message || "").toLowerCase();
  return message.includes("forbidden") || message.includes("403");
}

export const ORDERS_ACCESS_HELP =
  "Orders API returned 403. Fix: (1) In Partner Dashboard → Apps → your app → API access, enable Protected customer data and allow Order fields. (2) Ensure scopes include read_orders (and read_all_orders for orders older than 60 days). (3) Uninstall the app on the dev store and run shopify app dev to re-install with new scopes.";
