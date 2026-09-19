export { cn } from "cn";

export const getCurrencySymbol = () => {
  return import.meta.env.VITE_CURRENCY_SYMBOL || "₹";
};

export const formatCurrency = (amount) => {
  const symbol = getCurrencySymbol();
  return `${symbol}${parseFloat(amount).toFixed(2)}`;
};
