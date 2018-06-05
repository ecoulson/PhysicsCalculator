import { ExpressionLexer } from '../src/ExpressionLexer';
import { expect } from 'chai';
import { Token } from '../src/Token';
import { TokenType } from '../src/TokenType';

describe("Lexer Test Suite", () => {
	it("Should Lex a number Token at position 0", (done) => {
		try {
			let lexer = new ExpressionLexer("1234567890.1234567890");
			let tokens : Array<Token> = lexer.lex();
			expect(tokens[0].getTokenType()).to.equal(TokenType.Number);
			expect(tokens[0].getPos()).to.equal(0);
			done();
		} catch(err) {
			done(err);
		}
	});

	it("Should Lex a number Token at position 0", (done) => {
		try {
			let lexer = new ExpressionLexer("1234567890.1234567890");
			let tokens : Array<Token> = lexer.lex();
			expect(tokens[0].getTokenType()).to.equal(TokenType.Number);
			expect(tokens[0].getPos()).to.equal(0);
			done();
		} catch(err) {
			done(err);
		}
	});

	it("Should throw an UnrecognizedTokenError", (done) => {
		let lexer = new ExpressionLexer("1234567890");
		let tokens : Array<Token> = lexer.lex();
		expect(tokens[0].getTokenType()).to.equal(TokenType.Number);
		expect(tokens[0].getPos()).to.equal(0);
		done();
	})
});