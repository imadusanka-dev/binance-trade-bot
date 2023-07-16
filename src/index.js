import "dotenv/config";
import Trader from "./trader.js";
import { symbols } from "./constants.js";

const initApp = () => {
  //add cron job here
  const btcTrader = new Trader(symbols.BTCUSDT);
  btcTrader.run();
};

initApp();
