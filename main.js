import fetch from 'node-fetch';
import { delay, mapProducts } from './util/helpers';
import { sendQueue, sendProduct } from './util/discord';
import { webhook, delayTime, productCodes } from './util/config';

const init = async (prevStatus, prevQueue) => {
  const productResp = await fetch(`https://api.direct.playstation.com/commercewebservices/ps-direct-us/users/anonymous/products/productList?fields=BASIC&productCodes=${productCodes.join()}`);
  let productJson;

  try {
    productJson = await productResp.json();
  } catch (e) {
    return init(prevStatus, prevQueue);
  }

  const { products } = productJson;
  const newProducts = mapProducts(products);
  const queueResp = await fetch('https://direct.playstation.com/', {
    headers: {
      Host: 'direct.playstation.com',
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.16; rv:84.0) Gecko/20100101 Firefox/84.0',
      Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.5',
      'Accept-Encoding': 'gzip, deflate, br',
      DNT: 1,
      Connection: 'keep-alive',
      'Upgrade-Insecure-Requests': 1,
    },
    redirect: 'manual',
  });
  const queueStatus = queueResp.status;

  if (Object.keys(prevStatus).length === 0) {
    console.log('Monitor started');
    return init(newProducts, queueStatus);
  }

  if (queueStatus !== prevQueue) {
    if (queueResp.redirected) {
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
