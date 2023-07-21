import axios from "axios";
import { config } from "../config.js";
class TelegramService {
  constructor() {
    this.instance = axios.create({
      baseURL: "https://api.telegram.org",
    });
    this.chatId = config.TELEGRAM_CHAT_ID;
    this.botToken = config.TELEGRAM_BOT_TOKEN;
  }

  async sendMessage(text) {
    try {
      const response = await this.instance.get(
        `/bot${this.botToken}/sendMessage?chat_id=${this.chatId}&text=${text}`,
      );
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.description);
    }
  }
}

const telegramService = new TelegramService();
export default telegramService;
