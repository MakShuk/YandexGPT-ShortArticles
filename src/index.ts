import 'dotenv/config';
import axios, { AxiosRequestConfig } from 'axios';

const key = process.env.GPY_KEY;

interface JsonProps {
	article_url: string;
}

const headers = {
	Authorization: key,
};

const json: JsonProps = {
	article_url: 'https://habr.com/ru/news/729422/',
};

async function start(): Promise<void> {
	const url = 'https://300.ya.ru/api/sharing-url';
	const config: AxiosRequestConfig<JsonProps> = {
		headers,
		method: 'post',
		url,
		data: json,
	};
	const response = await axios(config);
	console.log(response.data);
}

start();
