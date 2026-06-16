import fs from "fs";
import { TokenName, TokenType, Token, TOKEN_TYPES } from "./token.js"

function readFile(filename) {
    return fs.readFileSync(filename, "utf8");
}

function tokenize(string) {
    let tokens = [];

    for (let tokenType of TOKEN_TYPES) {
        let matchedString = string.match(tokenType.regex);
        if ()
    }

    return tokens;
}

function main() {
    let filename = process.argv[2];
    console.log(JSON.stringify(readFile(filename)));
}

main();
