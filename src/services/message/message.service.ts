import axios, { AxiosError } from 'axios';
import 'dotenv/config';
import { LoggerService } from '../logger/logger.service';
import { code } from 'telegraf/format';

export class MessegeService {
	private token = process.env.BOT_TOKEN;
	private chatid = process.env.CHAT_ID;
	private logger = new LoggerService('MessegeService');

	private createFormatMessage(title: string, list: (string | null)[]): any {
		let message = `🚩  <b>${title}</b>`;
		for (const li of list) {
			message += `

			👉  ${li}`;
		}
		return message;
	}

	async send(title: string, list: (string | null)[]): Promise<void> {
		try {
			const response = await axios.get(`https://api.telegram.org/bot${this.token}/sendMessage`, {
				params: {
					chat_id: this.chatid,
					text: this.createFormatMessage(title, list),
					parse_mode: 'html',
				},
			});
		} catch (e) {
			if (e instanceof AxiosError) {
				this.logger.error(e.response?.data.description);
			}
		}
	}
}
