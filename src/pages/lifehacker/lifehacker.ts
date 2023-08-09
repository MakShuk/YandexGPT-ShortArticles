import { PuppeteerService } from '../../services/puppeteer/puppeteer.service';
import { ParseDate } from '../../types/page.type';
import { v4 as uuidv4 } from 'uuid';

export class LifehacerPage extends PuppeteerService {
	constructor(startPageUrl: string) {
		super(startPageUrl);
	}

	private async getListElements(selector: string): Promise<ParseDate[]> {
		const res = await this.page.$$eval(selector, (lis) =>
			lis.map((nodeListEl) => {
				const imgScr = nodeListEl.querySelector('img')?.src;
				const a = nodeListEl.querySelector('a');
				return {
					id: '',
					title: a?.ariaLabel || 'Element not found',
					content: [],
					url: a?.href || 'Element not found',
					ratio: 0,
					imageUrl: imgScr || 'Image, not found',
					date: Date.now(),
				};
			}),
		);

		return res.map((lis) => ({
			...lis,
			id: uuidv4().replace(/-/g, ''),
		}));
	}
	createId(): string {
		const id = uuidv4();
		return id;
	}

	async getParseRusult(): Promise<ParseDate[]> {
		await this.pageOpen();
		const data = await this.getListElements('.lh-small-article-card');
		await this.close();
		return data;
	}
}
