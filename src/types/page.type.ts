export type ParseDate = {
	id: string;
	title: string;
	content: string[];
	url: string;
	ratio: number;
	imageUrl: string;
	date: number;
};
export type IPageData = {
	title: string | null;
	list: (string | null)[];
	link: string | null;
};
