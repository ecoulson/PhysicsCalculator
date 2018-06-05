import { ExpressionLexer } from '../src/ExpressionLexer';
import { expect } from 'chai';
import { Token } from '../src/Token';
import { TokenType } from '../src/TokenType';

const number1 = "1234567890";
const number2 = "1234567890.1234567890";
const unrecognized = "©å˙∂∑˙å";

describe("Lexer Test Suite", () => {
	it("Should Lex a number Token at position 0", (done) => {
		try {
			let lexer = new ExpressionLexer(number1);
			let tokens : Array<Token> = lexer.lex();
			let token : Token = tokens[0];
			expect(token.getData()).to.equal(number1);
			expect(token.getTokenType()).to.equal(TokenType.Number);
			expect(token.getPos()).to.equal(0);
			done();
		} catch(err) {
			done(err);
		}
	});

	it("Should Lex a number Token at position 0", (done) => {
		try {
			let lexer = new ExpressionLexer(number2);
			let tokens : Array<Token> = lexer.lex();
			let token : Token = tokens[0];
			expect(token.getData()).to.equal(number2);
			expect(token.getTokenType()).to.equal(TokenType.Number);
			expect(token.getPos()).to.equal(0);
			done();
		} catch(err) {
			done(err);
		}
	});

	it("Should throw an UnrecognizedTokenError", (done) => {
		try {
			let lexer = new ExpressionLexer(unrecognized);
			let tokens : Array<Token> = lexer.lex();
			let error : Error = new Error("Should have thrown an error");
			done(error);
		} catch(err) {
			expect(err).to.haveOwnProperty("name");
			expect(err.name).to.equal("UnrecognizedTokenError");
			done();
		}
	})
});