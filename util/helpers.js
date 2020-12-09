export const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export const mapProducts = (products) => products.map((product) => ({
  name: product.name,
  stock: product.stock.stockLevelStatus,
}));
