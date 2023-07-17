import dayjs from "dayjs";
import { config } from "./config.js";
import { tradeSide, tradeTypes } from "./constants.js";
import binanceService from "./service/binance-service.js";
import { calculateNadarayaWatsonEnvelope } from "./nadaraya-watson.js";

class Trader {
  constructor(baseCurrency, quoteCurrency) {
    this.bsaeCurrency = baseCurrency;
    this.quoteCurrency = quoteCurrency;
  }
  async run() {
    try {
      //get symbol
      const symbol = `${this.bsaeCurrency}${this.quoteCurrency}`;

      // get price data from binance
      const priceData = await binanceService.getPriceData(symbol);

      // extract candle close price and close time
      const pricesData = priceData.map((d) => ({
        closePrice: parseFloat(d[4]),
        closeTime: d[6],
      }));

      // calculate envelope
      const { envelope } = calculateNadarayaWatsonEnvelope(
        pricesData,
        config.WINDOW_SIZE,
        config.BANDWIDTH,
        config.MULTIPLIER,
      );

      //get last envelope
      const lastEnvelope = envelope[envelope.length - 1];

      console.log("-----last envelope", lastEnvelope);

      //if entry is more than 1 hour, do nothing
      const difference = dayjs().diff(dayjs(lastEnvelope.time), "hour");

      if (difference > 1) {
        console.log(
          `-----difference is more than 1 hour. not trading. difference: ${difference} hours`,
        );
        return;
      }

      //check if last envelope is traded
      //time is used as client_order_id
      const order = await binanceService.getOrder(
        symbol,
        lastEnvelope.time.toString(),
      );

      //if order is traded, do nothing
      if (order) {
        console.log("-----order is traded. not trading", order);
        return;
      }

      //calculate order quantity
      //if order is buy, use quote currency balance
      //if order is sell, calculate quantity using base currency balance

      let quantity = 0;
      if (lastEnvelope.tradeDirection === tradeSide.BUY) {
        const balance = await binanceService.getBalance(this.quoteCurrency);
        quantity = balance.free;
      } else {
        const balance = await binanceService.getBalance(this.bsaeCurrency);
        const currentPrice = await binanceService.getCurrentPrice(symbol);
        quantity = balance.free / currentPrice.price;
      }

      //get integer quantity
      quantity = quantity.toString().split(".")[0];

      //if quantity is less than 10, do nothing
      if (quantity < 10) {
        console.log(
          `-----quantity is less than 10. not trading. quantity: ${quantity}`,
        );
        return;
      }

      //place trade
      const newTrade = await binanceService.placeOrder(
        `${this.bsaeCurrency}${this.quoteCurrency}`,
        lastEnvelope.tradeDirection,
        tradeTypes.MARKET,
        quantity,
        lastEnvelope.time,
      );

      //log trade
      console.log("-----new trade", newTrade);

      //add trade send telegram message
      // TODO: add telegram message
    } catch (error) {
      console.log(error);
    }
  }
}

export default Trader;
