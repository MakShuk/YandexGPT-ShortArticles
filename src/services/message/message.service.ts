import axios, { AxiosError } from 'axios';
import 'dotenv/config';
import { LoggerService } from '../logger/logger.service';
import { IPageData } from '../../types/page.type';
import { textContext } from '../telegraf/telegraf.type';

export class MessegeService {
	private token = process.env.BOT_TOKEN;
	private chatid = process.env.CHAT_ID;
	private logger = new LoggerService('MessegeService');

	createFormatMessage(message: IPageData): string {
		const { title, list, link } = message;
		let sendMessage = `<b>${title}</b>
		`;
		for (const li of list) {
			sendMessage += `
			 ${li}
			 `;
		}
		sendMessage += `
		<i>${link}</i>`;
		return sendMessage;
	}

	async sendToChat(message: IPageData): Promise<void> {
		try {
			const response = await axios.get(`https://api.telegram.org/bot${this.token}/sendMessage`, {
				params: {
					chat_id: this.chatid,
					text: this.createFormatMessage(message),
					parse_mode: 'html',
				},
			});
		} catch (e) {
			if (e instanceof AxiosError) {
				this.logger.error(e.response?.data.description);
			}
		}
	}

	async sendPhoto(ctx: textContext, message: IPageData): Promise<void> {
		await ctx.replyWithPhoto('https://www.orientaltravel.ru/img/tours/300/57836.jpg', {
			caption: this.createFormatMessage(message),
			parse_mode: 'HTML',
			has_spoiler: true,
		});
	}
}
