import "dotenv/config";
import cron from "node-cron";
import Trader from "./trader.js";
import { symbols } from "./constants.js";

//create instance of trader
//could be more than one (ETH, BTC, BNB etc)
//base currency is the currency to be traded
//quote currency is the currency to be used to buy base currency
//example: BTC/USDT
console.log("-----App Started");

const btcTrader = new Trader(symbols.BTC, symbols.USDT);
const ethTrader = new Trader(symbols.ETH, symbols.USDT);
const xrpTrader = new Trader(symbols.XRP, symbols.USDT);

//run trader every 30 mins
cron.schedule("*/30 * * * *", () => {
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
});
