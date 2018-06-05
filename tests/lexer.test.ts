import { ExpressionLexer } from '../src/ExpressionLexer';
import { expect } from 'chai';
import { Token } from '../src/Token';
import { TokenType } from '../src/TokenType';

const number1 = "1234567890";
const number2 = "1234567890.1234567890";
const identifer = "abcdefghijklmnopqrstuvwxyz";
const add = "+";
const subtract = "-";
const multiply = "*";
const divide = "/";
const exponentiation = "^";
const absolute = "|";
const leftParentheses = "(";
const rightParentheses = ")";
const unrecognized = "©å˙∂∑˙å";

describe("Lexer Test Suite", () => {
	it("Should lex a number token at position 0", (done) => {
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

	it("Should lex a number token at position 0", (done) => {
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

	it("Should lex an identifier token at position 0", (done) => {
		try {
			let lexer = new ExpressionLexer(identifer);
			let tokens : Array<Token> = lexer.lex();
			let token : Token = tokens[0];
			expect(token.getData()).to.equal(identifer);
			expect(token.getTokenType()).to.equal(TokenType.Identifier);
			expect(token.getPos()).to.equal(0);
			done();
		} catch(err) {
			done(err);
		}
	});

	it("Should lex an add token at position 0", (done) => {
		try {
			let lexer = new ExpressionLexer(add);
			let tokens : Array<Token> = lexer.lex();
			let token : Token = tokens[0];
			expect(token.getData()).to.equal(add);
			expect(token.getTokenType()).to.equal(TokenType.Add);
			expect(token.getPos()).to.equal(0);
			done();
		} catch(err) {
			done(err);
		}
	});

	it("Should lex a subtract token at position 0", (done) => {
		try {
			let lexer = new ExpressionLexer(subtract);
			let tokens : Array<Token> = lexer.lex();
			let token : Token = tokens[0];
			expect(token.getData()).to.equal(subtract);
			expect(token.getTokenType()).to.equal(TokenType.Subtract);
			expect(token.getPos()).to.equal(0);
			done();
		} catch(err) {
			done(err);
		}
	});

	it("Should lex a multiply token at positon 0", (done) => {
		try {
			let lexer = new ExpressionLexer(multiply);
			let tokens : Array<Token> = lexer.lex();
			let token : Token = tokens[0];
			expect(token.getData()).to.equal(multiply);
			expect(token.getTokenType()).to.equal(TokenType.Multiply);
			expect(token.getPos()).to.equal(0);
			done();
		} catch(err) {
			done(err);
		}
	});

	it("Should lex a divide token at positon 0", (done) => {
		try {
			let lexer = new ExpressionLexer(divide);
			let tokens : Array<Token> = lexer.lex();
			let token : Token = tokens[0];
			expect(token.getData()).to.equal(divide);
			expect(token.getTokenType()).to.equal(TokenType.Divide);
			expect(token.getPos()).to.equal(0);
			done();
		} catch(err) {
			done(err);
		}
	});

	it("Should lex an exponentiation token at positon 0", (done) => {
		try {
			let lexer = new ExpressionLexer(exponentiation);
			let tokens : Array<Token> = lexer.lex();
			let token : Token = tokens[0];
			expect(token.getData()).to.equal(exponentiation);
			expect(token.getTokenType()).to.equal(TokenType.Exponentiate);
			expect(token.getPos()).to.equal(0);
			done();
		} catch(err) {
			done(err);
		}
	});

	it("Should lex an absolute token at positon 0", (done) => {
		try {
			let lexer = new ExpressionLexer(absolute);
			let tokens : Array<Token> = lexer.lex();
			let token : Token = tokens[0];
			expect(token.getData()).to.equal(absolute);
			expect(token.getTokenType()).to.equal(TokenType.Absolute);
			expect(token.getPos()).to.equal(0);
			done();
		} catch(err) {
			done(err);
		}
	});

	it("Should lex a left parentheses token at positon 0", (done) => {
		try {
			let lexer = new ExpressionLexer(leftParentheses);
			let tokens : Array<Token> = lexer.lex();
			let token : Token = tokens[0];
			expect(token.getData()).to.equal(leftParentheses);
			expect(token.getTokenType()).to.equal(TokenType.LeftParentheses);
			expect(token.getPos()).to.equal(0);
			done();
		} catch(err) {
			done(err);
		}
	});

	it("Should lex a left parentheses token at positon 0", (done) => {
		try {
			let lexer = new ExpressionLexer(rightParentheses);
			let tokens : Array<Token> = lexer.lex();
			let token : Token = tokens[0];
			expect(token.getData()).to.equal(rightParentheses);
			expect(token.getTokenType()).to.equal(TokenType.RightParentheses);
			expect(token.getPos()).to.equal(0);
			done();
		} catch(err) {
			done(err);
		}
	});

	it("Should not have a whitespace token at position 0", (done) => {
		try {
			let lexer = new ExpressionLexer("\t" + rightParentheses);
			let tokens : Array<Token> = lexer.lex();
			let token : Token = tokens[0];
			expect(token.getTokenType()).to.not.equal(TokenType.Whitespace);
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