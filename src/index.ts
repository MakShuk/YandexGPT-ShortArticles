import cron from 'node-cron';
import { LoggerService } from './services/logger/logger.service';
import { MessegeService } from './services/message/message.service';
import { YandexService } from './services/yandex/yandex.service';
import { LifehacerPage } from './pages/lifehacker/lifehacker';
import { ParseDate } from './types/page.type';
import { FileService } from './services/file/file.service';
import { RozetkedPage } from './pages/rozetked/rozetked';
import { TelegrafServices } from './services/telegraf/telegraf.services';

const logger = new LoggerService('index');
const bot = new TelegrafServices(process.env.BOT_TOKEN || 'null');
bot.init();

async function urlToMassage(url: string): Promise<void> {
	if (typeof process.env.BOT_TOKEN === 'string' && typeof process.env.CHAT_ID === 'string') {
		const yandexGPT = new YandexService();
		const chat = new MessegeService();
		logger.warn('Запрос:', url);
		const message = await yandexGPT.getData(url);
		message
			? await bot.sendTextToChat(process.env.CHAT_ID, chat.createFormatMessage(message))
			: null;
	}
}

async function parsePage(): Promise<ParseDate[]> {
	const lifehiker = new LifehacerPage('https://lifehacker.ru/');
	const rozetkedPage = new RozetkedPage('https://rozetked.me/news');
	const rozetkedResponceData = await rozetkedPage.getParseRusult();
	const lifehikerResponceData = await lifehiker.getParseRusult();
	return [...lifehikerResponceData, ...rozetkedResponceData];
}

const getNewDataArray = (sessionInPage: ParseDate[], sessionInServer: ParseDate[]): ParseDate[] => {
	const newSession = sessionInPage.filter(
		(e) => !sessionInServer.some((session) => session.title === e.title),
	);
	return newSession;
};

async function start(): Promise<void> {
	try {
		const db = new FileService('db.json');
		const db_data = await db.readJsonFile();
		const data = await parsePage();
		const new_data = getNewDataArray(data, db_data);

		for (const data of new_data) {
			await urlToMassage(data.url);
			await db.writeJsonFile([...db_data, data]);
			await delay(15000);
		}
	} catch (error) {
		console.error('An error occurred:', error);
	}
}

async function delay(ms: number): Promise<void> {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

start();

cron.schedule('*/10 * * * *', () => {
	logger.info('running a task every  10 minutes');
	start();
});
