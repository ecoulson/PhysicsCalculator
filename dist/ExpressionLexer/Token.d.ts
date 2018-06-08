import { TokenType } from "./TokenType";
export declare class Token {
    private tokenType;
    private pos;
    private data;
    constructor(tokenType: TokenType, data: string, pos: number);
    getTokenType(): TokenType;
    getPos(): number;
    getData(): string;
    setData(data: string): void;
}
