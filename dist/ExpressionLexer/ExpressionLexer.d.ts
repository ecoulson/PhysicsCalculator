import { Token } from "./Token";
export declare class ExpressionLexer {
    private offset;
    private expression;
    constructor(expression: string);
    lex(): Array<Token>;
    private isEndOfExpression;
    private createToken;
    private isDigit;
    private isLetter;
    private readNumberToken;
    private readIdentifierToken;
    private peek;
}
