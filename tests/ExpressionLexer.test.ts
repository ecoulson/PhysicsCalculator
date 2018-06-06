import { expect } from 'chai';
import { Token } from '../src/ExpressionLexer/Token';
import { TokenType } from '../src/ExpressionLexer/TokenType';
import { ExpressionLexer } from '../src/ExpressionLexer/ExpressionLexer';
import { readInputFile } from './Helpers/InputHelper';
const inputs : Array<any> = readInputFile("ExpressionLexerInputs");

describe("Lexer Test Suite", () => {
	it(`Should lex a number [${inputs[0].input}] token at position 0`, (done) => {
		try {
			let lexer = new ExpressionLexer(inputs[0].input);
			let tokens : Array<Token> = lexer.lex();
			let token : Token = tokens[0];
			expect(token.getData()).to.equal(inputs[0].input);
			expect(token.getTokenType()).to.equal(TokenType.Number);
			done();
		} catch(err) {
			done(err);
		}
	});

	it(`Should lex a number [${inputs[1].input}] token at position 0`, (done) => {
		try {
			let lexer = new ExpressionLexer(inputs[1].input);
			let tokens : Array<Token> = lexer.lex();
			let token : Token = tokens[0];
			expect(token.getData()).to.equal(inputs[1].input);
			expect(token.getTokenType()).to.equal(TokenType.Number);
			done();
		} catch(err) {
			done(err);
		}
	});

	it(`Should lex a number [${inputs[2].input}] token at position 0`, (done) => {
		try {
			let lexer = new ExpressionLexer(inputs[2].input);
			let tokens : Array<Token> = lexer.lex();
			let token : Token = tokens[0];
			expect(token.getData()).to.equal(inputs[2].input);
			expect(token.getTokenType()).to.equal(TokenType.Number);
			done();
		} catch(err) {
			done(err);
		}
	});

	it(`Should lex an identifier [${inputs[3].input}] token at position 0`, (done) => {
		try {
			let lexer = new ExpressionLexer(inputs[3].input);
			let tokens : Array<Token> = lexer.lex();
			let token : Token = tokens[0];
			expect(token.getData()).to.equal(inputs[3].input);
			expect(token.getTokenType()).to.equal(TokenType.Identifier);
			done();
		} catch(err) {
			done(err);
		}
	});

	it(`Should lex an identifier [${inputs[4].input}] token at position 0`, (done) => {
		try {
			let lexer = new ExpressionLexer(inputs[4].input);
			let tokens : Array<Token> = lexer.lex();
			let token : Token = tokens[0];
			expect(token.getData()).to.equal(inputs[4].input);
			expect(token.getTokenType()).to.equal(TokenType.Identifier);
			done();
		} catch(err) {
			done(err);
		}
	});

	it("Should lex an add token at position 0", (done) => {
		try {
			let lexer = new ExpressionLexer("+");
			let tokens : Array<Token> = lexer.lex();
			let token : Token = tokens[0];
			expect(token.getData()).to.equal("+");
			expect(token.getTokenType()).to.equal(TokenType.Add);
			done();
		} catch(err) {
			done(err);
		}
	});

	it("Should lex a subtract token at position 0", (done) => {
		try {
			let lexer = new ExpressionLexer("-");
			let tokens : Array<Token> = lexer.lex();
			let token : Token = tokens[0];
			expect(token.getData()).to.equal("-");
			expect(token.getTokenType()).to.equal(TokenType.Subtract);
			done();
		} catch(err) {
			done(err);
		}
	});

	it("Should lex a multiply token at positon 0", (done) => {
		try {
			let lexer = new ExpressionLexer("*");
			let tokens : Array<Token> = lexer.lex();
			let token : Token = tokens[0];
			expect(token.getData()).to.equal("*");
			expect(token.getTokenType()).to.equal(TokenType.Multiply);
			done();
		} catch(err) {
			done(err);
		}
	});

	it("Should lex a divide token at positon 0", (done) => {
		try {
			let lexer = new ExpressionLexer("/");
			let tokens : Array<Token> = lexer.lex();
			let token : Token = tokens[0];
			expect(token.getData()).to.equal("/");
			expect(token.getTokenType()).to.equal(TokenType.Divide);
			done();
		} catch(err) {
			done(err);
		}
	});

	it("Should lex an exponentiation token at positon 0", (done) => {
		try {
			let lexer = new ExpressionLexer("^");
			let tokens : Array<Token> = lexer.lex();
			let token : Token = tokens[0];
			expect(token.getData()).to.equal("^");
			expect(token.getTokenType()).to.equal(TokenType.Exponentiate);
			done();
		} catch(err) {
			done(err);
		}
	});

	it("Should lex an absolute token at positon 0", (done) => {
		try {
			let lexer = new ExpressionLexer("|");
			let tokens : Array<Token> = lexer.lex();
			let token : Token = tokens[0];
			expect(token.getData()).to.equal("|");
			expect(token.getTokenType()).to.equal(TokenType.Absolute);
			done();
		} catch(err) {
			done(err);
		}
	});

	it("Should lex a left parentheses token at positon 0", (done) => {
		try {
			let lexer = new ExpressionLexer("(");
			let tokens : Array<Token> = lexer.lex();
			let token : Token = tokens[0];
			expect(token.getData()).to.equal("(");
			expect(token.getTokenType()).to.equal(TokenType.LeftParentheses);
			done();
		} catch(err) {
			done(err);
		}
	});

	it("Should lex a left parentheses token at positon 0", (done) => {
		try {
			let lexer = new ExpressionLexer(")");
			let tokens : Array<Token> = lexer.lex();
			let token : Token = tokens[0];
			expect(token.getData()).to.equal(")");
			expect(token.getTokenType()).to.equal(TokenType.RightParentheses);
			expect(token.getPos()).to.equal(0);
			expect(tokens.length).to.equal(1);
			done();
		} catch(err) {
			done(err);
		}
	});

	it("Should not have a whitespace token at position 0", (done) => {
		try {
			let lexer = new ExpressionLexer("\t" + ")");
			let tokens : Array<Token> = lexer.lex();
			let token : Token = tokens[0];
			expect(token.getTokenType()).to.not.equal(TokenType.Whitespace);
			done();
		} catch(err) {
			done(err);
		}
	});

	it("Should have one of every token (Excluding whitespace)", (done) => {
		try {
			let lexer = new ExpressionLexer(inputs[5].input);
			let tokens : Array<Token> = lexer.lex();
			for (let i = 0; i < tokens.length; i++) {
				expect(tokens[i].getData()).to.equal(inputs[5].values[i]);
				expect(tokens[i].getTokenType()).to.equal(inputs[5].types[i]);
			}
			done();
		} catch(err) {
			done(err);
		}
	});

	it("Each token should be at the correct position", (done) => {
		try {
			let lexer = new ExpressionLexer(inputs[5].input);
			let tokens : Array<Token> = lexer.lex();
			for (let i = 0; i < tokens.length; i++) {
				expect(tokens[i].getData()).to.equal(inputs[5].values[i]);
				expect(tokens[i].getPos()).to.equal(inputs[5].pos[i]);
			}
			done();
		} catch(err) {
			done(err);
		}
	})

	it("Should throw an UnrecognizedTokenError", (done) => {
		try {
			let lexer = new ExpressionLexer(inputs[6].input);
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