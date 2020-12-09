import fetch from 'node-fetch';

const sendWebhook = (webhook, name, status) => fetch(webhook, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    content: `${name} status changed to ${status} at https://direct.playstation.com/`,
  }),
});

export default sendWebhook;
