import 'dotenv/config';
import axios, { AxiosRequestConfig } from 'axios';
import { LoggerService } from '../logger/logger.service';

interface IResponce {
	status: string;
	sharing_url: string;
}

export class YandexService {
	private token = process.env.GPY_KEY;
	private yandexUrl = 'https://300.ya.ru/api/sharing-url';
	private logger = new LoggerService('YandexService');

	async getPage(url: string): Promise<string> {
		try {
			const json = {
				article_url: url,
			};

			const headers = {
				Authorization: this.token,
			};

			const config: AxiosRequestConfig = {
				headers,
				method: 'post',
				url: this.yandexUrl,
				data: json,
			};

			const response: IResponce = (await axios(config)).data;
			return response.sharing_url;
		} catch (e) {
			if (e instanceof Error) {
				this.logger.error(e.message);
				return e.message;
			}
			throw Error('YandexService Erorr');
		}
	}
}
