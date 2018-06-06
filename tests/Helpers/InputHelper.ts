import * as fs from 'fs';
import * as path from 'path';

export function readInputFile(file: string) {
	try {
		let data = fs.readFileSync(path.resolve(__dirname, '..', 'Inputs', `${file}.json`), 'utf-8');
		return JSON.parse(data);
	} catch (err) {
		throw err;
	}
}