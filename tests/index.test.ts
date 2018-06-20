import { getWorkSpace } from '../src/main'
import { expect } from 'chai';
import { WorkSpace } from '../src/WorkSpace/WorkSpace';

describe('Library', () => {
	it('Should get a new workspace', () => {
		try {
			let workspace : WorkSpace = getWorkSpace();
		} catch(err) {
			return err;
		}
	})
});