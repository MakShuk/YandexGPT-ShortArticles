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

async function urlToMassage(url: string): Promise<void> {
	if (typeof process.env.BOT_TOKEN === 'string' && typeof process.env.CHAT_ID === 'string') {
		const bot = new TelegrafServices(process.env.BOT_TOKEN);
		const yandexGPT = new YandexService();
		const chat = new MessegeService();
		const message = await yandexGPT.getData(url);
		bot.init();
		await bot.sendTextToChat(process.env.CHAT_ID, chat.createFormatMessage(message));
		//chat.sendToChat(message);
	}
}

async function parsePage(): Promise<ParseDate[]> {
	const lifehiker = new LifehacerPage('https://lifehacker.ru/');
	const rozetkedPage = new RozetkedPage('https://rozetked.me/news');
	const rozetkedResponceData = await rozetkedPage.getParseRusult();
	const lifehikerResponceData = await lifehiker.getParseRusult();
	return [...lifehikerResponceData, ...rozetkedResponceData];
}

async function saveData(data: ParseDate[]): Promise<ParseDate[]> {
	const db = new FileService('db.json');
	if (!(await db.isCreated())) await db.writeJsonFile([]);
	const db_data = await db.readJsonFile();
	const new_date = getNewDataArray(data, db_data);
	await db.writeJsonFile([...db_data, ...new_date]);
	return new_date;
}

async function start(): Promise<void> {
	try {
		const date = await parsePage();
		const new_data = await saveData(date);

		for (const e of new_data) {
			await urlToMassage(e.url);
		}
	} catch (error) {
		console.error('An error occurred:', error);
	}
}

const getNewDataArray = (sessionInPage: ParseDate[], sessionInServer: ParseDate[]): ParseDate[] => {
	const newSession = sessionInPage.filter(
		(e) => !sessionInServer.some((session) => session.title === e.title),
	);
	return newSession;
};

cron.schedule('*/10 * * * *', () => {
	logger.info('running a task every  10 minutes');
	start();
});

start();
