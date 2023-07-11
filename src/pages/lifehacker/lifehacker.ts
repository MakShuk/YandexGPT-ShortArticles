import { PuppeteerService } from '../../services/puppeteer/puppeteer.service';
import { ParseDate } from '../../types/page.type';

export class LifehacerPage extends PuppeteerService {
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
					title: el.ariaLabel || 'Error, element not found',
					url: el.href || 'Error, element not found',
				};
			}),
		);
	}

	async getParseRusult(): Promise<ParseDate[]> {
		await this.pageOpen();
		const data = await this.getListElements(
			'#main > main > div.article-card-container > div.container a.lh-small-article-card__link',
		);
		await this.close();
		return data;
	}
}
