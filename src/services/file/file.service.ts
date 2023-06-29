import fs from 'fs/promises';
import { WriteStream, createWriteStream, createReadStream, ReadStream } from 'fs';
import { resolve } from 'path';
import { Logger } from 'tslog';
import { LoggerService } from '../logger/logger.service';

export class FileService {
	logger = new LoggerService('FileService');
	path: string;
	constructor(private fileName: string) {
		this.path = resolve(fileName);
	}

	async writeJsonFile(data: any): Promise<void> {
		try {
			const dataJson = JSON.stringify(data);
			await fs.writeFile(this.fileName, dataJson);
			this.logger.info(`Data written to ${this.fileName}`);
		} catch (error) {
			this.logger.error(error);
		}
	}
	writeFile(data: any): void {
		fs.writeFile(this.fileName, data)
			.then(() => this.logger.info(`Data written to ${this.fileName}`))
			.catch((e) => this.logger.error(e));
	}

	async readJsonFile(): Promise<any> {
		try {
			const data = await fs.readFile(this.path, { encoding: 'utf-8' });
			const jsonData = JSON.parse(data);
			return jsonData;
		} catch (e) {
			this.logger.error(e);
			return null;
		}
	}

	async readFile(): Promise<any> {
		try {
			const data = await fs.readFile(this.path, { encoding: 'utf-8' });
			return data;
		} catch (e) {
			this.logger.error(e);
			return null;
		}
	}

	createWriteStream(): WriteStream {
		return createWriteStream(this.path);
	}

	createReadStream(): ReadStream {
		return createReadStream(this.path);
	}

	delete(): Promise<string> {
		return new Promise((resolve, reject) => {
			fs.unlink(this.path)
				.then(() => resolve(`File delete ${this.path}`))
				.catch((e) => reject(e));
		});
	}
	async appendFile(text: string): Promise<void> {
		try {
			await fs.appendFile(this.fileName, `${text}\n`);
			this.logger.info('Лог сохранён!');
		} catch (e) {
			this.logger.error('Ошибка при добавлении в файл:', e);
		}
	}

	async isCreated(): Promise<boolean> {
		try {
			await fs.access(this.path);
			return true;
		} catch (error) {
			return false;
		}
	}
}
