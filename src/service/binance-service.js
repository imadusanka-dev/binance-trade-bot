import axios from "axios";
import { config } from "../config.js";
import crypto from "crypto";

class BinanceService {
  constructor() {
    this.instance = axios.create({
      baseURL: "https://api.binance.com/api/v3",
      headers: {
        "X-MBX-APIKEY": config.BINANCE_API_KEY,
        "X-MBX-APISECRET": config.BINANCE_API_SECRET,
      },
    });
    this.interval = config.INTERVAL;
    this.windowSize = config.WINDOW_SIZE;
  }

  //this wall return candlestick data
  async getPriceData(symbol) {
    try {
      const response = await this.instance.get(
        `/klines?symbol=${symbol}&interval=${this.interval}&limit=${this.windowSize}`,
      );
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.msg);
    }
  }

  async getCurrentPrice(symbol) {
    try {
      const response = await this.instance.get(
        `/ticker/price?symbol=${symbol}`,
      );
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.msg);
    }
  }

  async getBalance(asset) {
    try {
      // Generate the query string
      const queryString = `timestamp=${Date.now()}`;

      // Generate the signature
      const signature = crypto
        .createHmac("sha256", config.BINANCE_API_SECRET)
        .update(queryString)
        .digest("hex");

      const response = await this.instance.get(
        `/account?${queryString}&signature=${signature}`,
      );

      const balances = response.data?.balances;

      return balances.find((b) => b?.asset === asset);
    } catch (error) {
      throw new Error(error.response?.data?.msg);
    }
  }

  async getOrder(symbol, clientOrderId) {
    try {
      const queryString = `symbol=${symbol}&origClientOrderId=${clientOrderId}&timestamp=${Date.now()}`;
      const signature = crypto
        .createHmac("sha256", config.BINANCE_API_SECRET)
        .update(queryString)
        .digest("hex");

      const response = await this.instance.get(
        `/order?${queryString}&signature=${signature}`,
      );
      return response.data;
    } catch (error) {
      if (error.response?.data?.code === -2013) {
        return null;
      }
      throw new Error(error.response?.data?.msg);
    }
  }

  async placeOrder(symbol, side, type, quoteOrderQty, clientOrderId) {
    try {
      const queryString = `symbol=${symbol}&side=${side}&type=${type}&quoteOrderQty=${quoteOrderQty}&newClientOrderId=${clientOrderId}&timestamp=${Date.now()}`;
      const signature = crypto
        .createHmac("sha256", config.BINANCE_API_SECRET)
        .update(queryString)
        .digest("hex");

      const response = await this.instance.post(
        `/order?${queryString}&signature=${signature}`,
      );
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.msg);
    }
  }
}

const binanceService = new BinanceService();

export default binanceService;
