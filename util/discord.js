import fetch from 'node-fetch';

export const sendProduct = (webhook, name, status) => fetch(webhook, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    content: `${name} status changed to ${status} at https://direct.playstation.com/`,
  }),
});

export const sendQueue = (webhook, status) => fetch(webhook, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    content: `Queue ${status} at https://direct.playstation.com/`,
  }),
});
