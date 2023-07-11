import 'dotenv/config';
import axios, { AxiosError, AxiosRequestConfig } from 'axios';
import { LoggerService } from '../logger/logger.service';
import { PuppeteerService } from '../puppeteer/puppeteer.service';
import { Selector } from '../../enums/selector';
import { IPageData } from '../../types/page.type';

interface IResponce {
	status: string;
	sharing_url: string;
}

export class YandexService {
	private token = process.env.GPY_KEY;
	private yandexUrl = 'https://300.ya.ru/api/sharing-url';
	private logger = new LoggerService('YandexService');
	private pageService = PuppeteerService;

	private async getShortPageURL(url: string): Promise<string> {
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
			if (e instanceof AxiosError) {
				this.logger.error(e.name);
				return e.name;
			}
			return `${e}`;
			//throw Error('YandexService Erorr');
		}
	}

	private async getShortPageData(url: string): Promise<IPageData> {
		const yandex = new this.pageService(url);
		await yandex.pageOpen();
		const title = await yandex.getTextContent(Selector.title);
		const list = await yandex.getListTextContent(Selector.list);
		const link = await yandex.getHref(Selector.link);
		const clearLink = link;
		await yandex.close();
		return { title: title, list: list, link: clearLink };
	}

	async getData(url: string): Promise<IPageData | null> {
		const shortPageUrl = await this.getShortPageURL(url);
		if (shortPageUrl === 'AxiosError') {
			return null;
		}
		return await this.getShortPageData(shortPageUrl);
	}
}
