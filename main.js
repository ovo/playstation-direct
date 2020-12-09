import fetch from 'node-fetch';
import { delay, mapProducts } from './util/helpers';
import sendWebhook from './util/discord';
import { webhook, delayTime, productCodes } from './util/config';

const init = async (prevStatus) => {
  const resp = await fetch(`https://api.direct.playstation.com/commercewebservices/ps-direct-us/users/anonymous/products/productList?fields=BASIC&productCodes=${productCodes.join()}`);
  const { products } = await resp.json();
  const newStatus = mapProducts(products);

  if (Object.keys(prevStatus).length === 0) {
    console.log('Monitor started');
    return init(newStatus);
  }

  for (const product of products) {
    const currentProduct = prevStatus.find((el) => el.name === product.name);
    if (currentProduct.stock !== product.stock.stockLevelStatus) {
      console.log(`${product.name} status changed to ${product.stock.stockLevelStatus}`);
      await sendWebhook(webhook, product.name, product.stock.stockLevelStatus);
    }
  }

  await delay(delayTime);
  return init(newStatus);
};

init({});
