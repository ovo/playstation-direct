import fetch from 'node-fetch';
import { delay, mapProducts } from './util/helpers';
import { sendQueue, sendProduct } from './util/discord';
import { webhook, delayTime, productCodes } from './util/config';

const init = async (prevStatus, prevQueue) => {
  const productResp = await fetch(`https://api.direct.playstation.com/commercewebservices/ps-direct-us/users/anonymous/products/productList?fields=BASIC&productCodes=${productCodes.join()}`);
  const queueResp = await fetch('https://direct.playstation.com/en-us/hardware');
  const queueStatus = queueResp.status;
  const { products } = await productResp.json();
  const newProducts = mapProducts(products);

  if (Object.keys(prevStatus).length === 0) {
    console.log('Monitor started');
    return init(newProducts, queueStatus);
  }

  if (queueStatus !== prevQueue) {
    if (queueStatus === 302) {
      await sendQueue(webhook, 'live');
    } else {
      await sendQueue(webhook, 'down');
    }
  }

  for (const product of products) {
    const currentProduct = prevStatus.find((el) => el.name === product.name);
    if (currentProduct.stock !== product.stock.stockLevelStatus) {
      console.log(`${product.name} status changed to ${product.stock.stockLevelStatus}`);
      await sendProduct(webhook, product.name, product.stock.stockLevelStatus);
    }
  }

  await delay(delayTime);
  return init(newProducts, queueStatus);
};

init({}, null);
