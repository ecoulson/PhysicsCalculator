import { evaluate } from "../src/main";
import { expect } from 'chai';

describe('Evaluate', () => {
	it('Should return 0', function (done) {
		let value = evaluate("1+1");
		expect(value).to.equal(0);
		done();
	});
});