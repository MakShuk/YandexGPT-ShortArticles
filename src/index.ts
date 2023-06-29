import cron from 'node-cron';
import { LoggerService } from './services/logger/logger.service';
import { MessegeService } from './services/message/message.service';
import { YandexService } from './services/yandex/yandex.service';
import { LifehacerPage } from './pages/lifehacker/lifehacker';
import { ParseDate } from './pages/lifehacker/lifehacker.type';
import { FileService } from './services/file/file.service';

const logger = new LoggerService('index');

async function urlToMassage(url: string): Promise<void> {
	const yandexGPT = new YandexService();
	const chat = new MessegeService();
	const message = await yandexGPT.getData(url);

	chat.send(message.title || 'Error Title', message.list);
}

async function parsePage(): Promise<ParseDate[]> {
	const lifehiker = new LifehacerPage('https://lifehacker.ru/');
	return await lifehiker.getParseRusult();
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
	logger.info('running a task every two minutes');
	start();
});
