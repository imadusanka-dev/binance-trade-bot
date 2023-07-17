import "dotenv/config";
import dayjs from "dayjs";
import cron from "node-cron";
import Trader from "./trader.js";
import { symbols } from "./constants.js";

//create instance of trader
//could be more than one (ETH, BTC, BNB etc)
//base currency is the currency to be traded
//quote currency is the currency to be used to buy base currency
//example: BTC/USDT
const btcTrader = new Trader(symbols.BTC, symbols.USDT);

//run trader every 30 mins
cron.schedule("*/30 * * * *", () => {
  console.log("-----running trader", dayjs().format("YYYY-MM-DD HH:mm:ss"));

  //run all trader instances here
  btcTrader.run();
});
