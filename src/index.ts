import cron from 'node-cron';
import { LoggerService } from './services/logger/logger.service';
import { MessegeService } from './services/message/message.service';
import { YandexService } from './services/yandex/yandex.service';
import { LifehacerPage } from './pages/lifehacker/lifehacker';
import { IPageData, ParseDate } from './types/page.type';
import { FileService } from './services/file/file.service';
import { RozetkedPage } from './pages/rozetked/rozetked';
import { TelegrafServices } from './services/telegraf/telegraf.services';
import { message } from 'telegraf/filters';

const logger = new LoggerService('index');
const bot = new TelegrafServices(process.env.BOT_TOKEN || 'null');
bot.init();

async function urlToMassage(data: ParseDate): Promise<IPageData | null> {
	if (typeof process.env.BOT_TOKEN === 'string' && typeof process.env.CHAT_ID === 'string') {
		const yandexGPT = new YandexService();
		const chat = new MessegeService();
		logger.warn('Запрос:', data.url);
		const message = await yandexGPT.getData(data.url);
		message
			? await bot.sendImageToChat(
					process.env.CHAT_ID,
					data.imageUrl,
					chat.createFormatMessage(message),
			  )
			: null;
		return message;
	}
	return null;
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
			console.log(data);
			const shortData = await urlToMassage(data);
			const db_data = await db.readJsonFile();
			data.content = shortData?.list?.filter(
				(item): item is string => typeof item === 'string',
			) || ['not data'];
			await db.writeJsonFile([...db_data, data]);
			await delay(1500);
		}
	} catch (error) {
		console.error('An error occurred:', error);
	}
}

async function delay(ms: number): Promise<void> {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

cron.schedule('*/10 * * * *', () => {
	logger.info('running a task every  10 minutes');
	start();
});
