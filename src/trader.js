import { config } from "./config.js";
import binanceService from "./service/binance-service.js";
import { calculateNadarayaWatsonEnvelope } from "./nadaraya-watson.js";
import { tradeSide, tradeTypes, symbols } from "./constants.js";

class Trader {
  constructor(symbol) {
    this.symbol = symbol;
  }
  async run() {
    try {
      // get price data from binance
      const priceData = await binanceService.getPriceData(this.symbol);

      // extract candle close price and close time
      const pricesData = priceData.map((d) => ({
        closePrice: parseFloat(d[4]),
        closeTime: d[6],
      }));

      const { envelope } = calculateNadarayaWatsonEnvelope(
        pricesData,
        config.WINDOW_SIZE,
        config.BANDWIDTH,
        config.MULTIPLIER,
      );

      //get last envelope
      const lastEnvelope = envelope[envelope.length - 1];

      //check if last envelope is traded
      const order = await binanceService.getOrder(
        this.symbol,
        lastEnvelope.time.toString(),
      );

      //console.log(order);

      //if order is traded, do nothing
      //if (order) return;

      console.log("not traded");
      //if not traded, trade
      const orders = await binanceService.placeOrder(
        this.symbol,
        lastEnvelope.tradeDirection,
        tradeTypes.MARKET,
        "1",
        lastEnvelope.time,
      );
    } catch (error) {
      console.log(error);
    }
  }
}

export default Trader;
