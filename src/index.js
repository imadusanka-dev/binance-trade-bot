import "dotenv/config";
import express from "express";
import Trader from "./trader.js";
import { symbols } from "./constants.js";

const app = express();

//create instance of trader
//could be more than one (ETH, BTC, BNB etc)
//base currency is the currency to be traded
//quote currency is the currency to be used to buy base currency
//example: BTC/USDT
const btcTrader = new Trader(symbols.BTC, symbols.USDT);
const ethTrader = new Trader(symbols.ETH, symbols.USDT);
const xrpTrader = new Trader(symbols.XRP, symbols.USDT);

app.post("/start", (req, res) => {
  console.log(
    "-----Running Trader",
    new Date().toLocaleString("en-US", {
      timeZone: "Asia/Colombo",
    }),
  );

  //run all trader instances here
  btcTrader.run();
  ethTrader.run();
  xrpTrader.run();

  res.status(200).json({
    message: "Trader started",
  });
});

app.listen(3000, () => {
  console.log(`-----Server is running on port 3000`);
});
