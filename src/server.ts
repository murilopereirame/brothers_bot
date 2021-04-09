import Client from "./client";
import express from 'express';

const app = express();

let port = process.env.PORT || 8080;
let bas64 = '';

app.get('/', (req, res) => {
  res.send(bas64);
})

app.listen(port, async () => {
  bas64 = (await Client.getInstance()).getQrCode();
  console.log(`Example app listening at ${port}`)
})