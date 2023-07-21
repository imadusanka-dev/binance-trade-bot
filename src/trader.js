import dayjs from "dayjs";
import { config } from "./config.js";
import binanceService from "./service/binance-service.js";
import telegramService from "./service/telegram-service.js";
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

      //if entry is more than 2 hours, do nothing
      const difference = dayjs().diff(dayjs(lastEnvelope.time), "hour");

      if (difference > 2) {
        console.log(
          `-----difference is more than 1 hour. not trading. difference: ${difference} hours`,
        );
        return;
      }

      //generate message
      const message = `${this.bsaeCurrency}/${this.quoteCurrency} - ${
        lastEnvelope.tradeDirection
      } @ ${lastEnvelope.price}
      Candle Close Time: ${new Date(lastEnvelope.time).toLocaleString("en-US", {
        timeZone: "Asia/Colombo",
      })}`;

      const response = await telegramService.sendMessage(message);
      console.info("-----message sent to telegram", response.result?.text);
    } catch (error) {
      console.log(error);
    }
  }
}

export default Trader;
