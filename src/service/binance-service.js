import axios from "axios";
import { config } from "../config.js";

class BinanceService {
  constructor() {
    this.instance = axios.create({
      baseURL: "https://api.binance.us/api",
    });
    this.interval = config.INTERVAL;
    this.windowSize = config.WINDOW_SIZE;
  }

  async getPriceData(symbol) {
    try {
      const response = await this.instance.get(
        `/v3/klines?symbol=${symbol}&interval=${this.interval}&limit=${this.windowSize}`,
      );
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.msg);
    }
  }
}

const binanceService = new BinanceService();

export default binanceService;
