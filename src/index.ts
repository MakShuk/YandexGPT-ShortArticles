import { LoggerService } from './services/logger/logger.service';
import { YandexService } from './services/yandex/Yandex.service';

const logger = new LoggerService('index');

async function start(): Promise<void> {
	const promt = new YandexService();
	const answer = await promt.getPage('https://habr.com/ru/articles/744202/');
	logger.warn(answer);
}

start();
