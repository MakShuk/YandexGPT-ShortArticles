import { Telegraf, session } from 'telegraf';
import { message } from 'telegraf/filters';
import { LoggerService } from '../logger/logger.service';
import { FileContext, textContext, AudioContext } from './telegraf.type';

export class TelegrafServices {
	bot: Telegraf;
	logger = new LoggerService();
	constructor(token: string) {
		this.bot = new Telegraf(token);
	}

	async init(): Promise<void> {
		this.bot.launch();
		this.useSession();
	}

	async sendImageToChat(chat_id: string | number, imgUrl: string, caption?: string): Promise<void> {
		try {
			await this.bot.telegram.sendPhoto(chat_id, imgUrl, {
				caption: caption,
				parse_mode: 'HTML',
			});
		} catch (e) {
			this.logger.error(`chat_id: ${chat_id}, imgUrl: ${imgUrl} Error while message: ${e}`);
		}
	}

	async sendTextToChat(chat_id: string | number, text: string): Promise<void> {
		try {
			await this.bot.telegram.sendMessage(chat_id, text, {
				parse_mode: 'HTML',
				disable_web_page_preview: true,
			});
		} catch (e) {
			this.logger.error(`chat_id: ${chat_id} Error while message: ${e}`);
		}
	}

	async comand(handlerFunc: (ctx: textContext) => Promise<void>, comand: string): Promise<void> {
		this.bot.command(comand, async (context) => {
			try {
				await handlerFunc(context);
			} catch (e) {
				this.logger.error(`Comand /${comand} Error while message: ${e}`);
			}
		});
	}

	async speechToAction(handlerFunc: (ctx: AudioContext) => Promise<void>): Promise<void> {
		this.bot.on(message('voice'), async (context) => {
			try {
				await handlerFunc(context);
			} catch (e) {
				this.logger.error(`Error while speechToAction message ${e}`);
			}
		});
	}

	async textToAction(handlerFunc: (ctx: textContext) => Promise<void>): Promise<void> {
		this.bot.on(message('text'), async (context) => {
			try {
				await handlerFunc(context);
			} catch (e) {
				this.logger.error(`Error while textToAction message ${e}`);
			}
		});
	}

	async fileToAction(handlerFunc: (ctx: FileContext) => Promise<void>): Promise<void> {
		this.bot.on('document', async (context) => {
			try {
				await handlerFunc(context);
			} catch (e) {
				this.logger.error(`Error while textToAction message ${e}`);
			}
		});
	}

	private useSession(): void {
		this.bot.use(session());
	}
}
