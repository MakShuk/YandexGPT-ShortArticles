import { PuppeteerService } from '../../services/puppeteer/puppeteer.service';
import { ParseDate } from '../../types/page.type';

export class RozetkedPage extends PuppeteerService {
	constructor(startPageUrl: string) {
		super(startPageUrl);
	}

	private async getListElements(selector: string): Promise<ParseDate[]> {
		const result = {
			title: '',
			url: '',
			shortened: false,
		};
		return await this.page.$$eval(selector, (lis) =>
			lis.map((a) => {
				const el = a as HTMLAnchorElement;
				return {
					title: el.innerText || 'Error, element not found',
					url: `${a.getAttribute('href')}` || 'Error, element not found',
				};
			}),
		);
	}

	async getParseRusult(): Promise<ParseDate[]> {
		await this.pageOpen();
		const data = await this.getListElements('.post_new-title a');
		await this.close();
		return data;
	}
}
