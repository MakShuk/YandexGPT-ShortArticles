import puppeteer, { Browser, Page } from 'puppeteer';
import { FileService } from '../file/file.service';
import { LoggerService } from '../logger/logger.service';

export class PuppeteerService {
	private browser: Browser;
	protected page: Page;
	protected logger = new LoggerService('puppeteer');
	private cookieFile: FileService;
	private screenshotCounter = 1;

	constructor(private startPageUrl: string, private cookieFilePath?: string) {
		this.cookieFile = new FileService(cookieFilePath || './src/');
	}

	async pageOpen(): Promise<void> {
		this.browser = await puppeteer.launch({
			headless: 'new',
		});
		this.logger.info('browser init');
		this.page = await this.browser.newPage();
		this.logger.info('page init');
		await this.page.goto(this.startPageUrl);
		this.logger.info('Navigated to startPageUrl');
	}

	protected async goTo(url: string): Promise<void> {
		await this.page.goto(url);
		await this.screenshot();
	}

	protected async screenshot(): Promise<void> {
		const screenshot = await this.page.screenshot();
		const screenshotFile = new FileService(`screenshot-${this.screenshotCounter}.jpg`);
		screenshotFile.writeFile(screenshot);
		this.screenshotCounter++;
	}

	async close(): Promise<void> {
		await this.browser.close();
	}

	protected async click(selectorForClick: string): Promise<void> {
		await this.page.click(selectorForClick);
		this.logger.info(`Клик по элементу ${selectorForClick}`);
	}

	async getTextContent(selector: string): Promise<string | null> {
		try {
			return await this.page.$eval(selector, (element) => element.textContent);
		} catch (e) {
			if (e instanceof Error) {
				this.logger.error(e.message);
			}
			return null;
		}
	}

	async getHref(selector: string): Promise<string | null> {
		try {
			return await this.page.$eval(selector, (el) => {
				const anchor = el as HTMLAnchorElement;
				return anchor.href;
			});
		} catch (e) {
			if (e instanceof Error) {
				this.logger.error(e.message);
			}
			return null;
		}
	}

	//a.href

	async getListTextContent(selector: string): Promise<(string | null)[]> {
		try {
			return await this.page.$$eval(selector, (lis) => lis.map((li) => li.textContent));
		} catch (e) {
			if (e instanceof Error) {
				this.logger.error(e.message);
			}
			return [null];
		}
	}

	protected async delay(ms: number): Promise<void> {
		return new Promise((resolve) => setTimeout(resolve, ms));
	}

	protected async setValue(selector: string, value: string): Promise<void> {
		await this.page.type(selector, value);
	}

	protected async saveCookie(): Promise<void> {
		const cookies = await this.page.cookies();
		const cookieJson = JSON.stringify(cookies, null, 2);
		await this.cookieFile.writeJsonFile(cookieJson);
	}

	protected async loadCookie(): Promise<void> {
		const cookieJson = await this.cookieFile.readJsonFile();
		const cookies = JSON.parse(cookieJson);
		if (cookies) await this.page.setCookie(...cookies);
		this.logger.info('cookies loaded');
	}
}
