const express = require('express');
const fs = require('fs');
const key = fs.readFileSync(`${__dirname}/cert/key.pem`);
const cert = fs.readFileSync(`${__dirname}/cert/cert.pem`);
const https = require('https');
const getCookie = (req, searchKey) => {
  const cookie = req.headers.cookie;
  let res = null;
  if (cookie) {
    cookie.split(';').forEach(keyVal => {
      keyValArray = keyVal.trim().split('=');
      const key = keyValArray[0];
      const value = keyValArray[1];
      if (key == searchKey) {
        res = decodeURIComponent(value);
      }
    });
  }
  return res;
}
const genServer = (pages) => {
    const app = express();
    app.get('/', (req, res) => {
        res.sendFile(`${__dirname}/index.html`);
    });
    if (pages) {
      pages.forEach(html => {
        const page = html;
        const path = page.split('.')[0];
        app.get(`/${path}`, (req, res) => {
          res.cookie(`${path}-page-html`, page);
          res.sendFile(`${__dirname}/${page}`);
        });
      });
    }
    app.get('/track', (req, res) => {
      res.cookie('some-tracking-cookie-name', 'some-tracking-cookie-value');
      res.send();
    });
    app.get('/pay', (req, res) => {
      res.cookie('payment-session', req.query['payment-session'], {sameSite: 'none', secure: true});
      res.send();
    });
    app.get('/payment-info', (req, res) => {
      const session = getCookie(req, 'payment-session');
      res.send(session);      
    });
    app.get('/chat-message', (req, res) => {
      let chatSession = getCookie(req, 'chat-session');
      if (chatSession) {
        chatSession = JSON.parse(atob(chatSession));
      } else {
        chatSession = [];
      }
      const message = req.query.message;
      chatSession.push({position: 'right', text: message});
      // Demo purpose. Respond random emoji.
      const getRandomExpression = _ => {
        // ['😊', '😉', '😋', '😆', '😁']
        return ['happy', 'wink', 'yummy', 'laugh', 'smile'][Math.floor(5*Math.random())]
      };
      const response = `${getRandomExpression()}|${getRandomExpression()}|${getRandomExpression()}`;
      chatSession.push({position: 'left', text: response});
      // Demo purpose (do not do this in production!). Simply encode the chat log as session data
      res.cookie('chat-session', btoa(JSON.stringify(chatSession)), {sameSite: 'none', secure: true, /** partitioned: true **/});
      res.send(response);
    });
    app.get('/chat-log', (req, res) => {
      const session = getCookie(req, 'chat-session');
      res.send(session);    
    });
        
    const listener = https.createServer({key: key, cert: cert }, app).listen(443, _ => {
      console.log('Sever started!')
    });
};
genServer(['product.html', 'purchase.html', 'chat.html', 'payments.html']);
