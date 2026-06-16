import fs from "fs";
import { TokenTypeInfo, TOKEN_TYPES, Token } from "./token.js"

function readFile(filename) {
    return fs.readFileSync(filename, "utf8");
}

function tokenize(string) {
    let tokens = [];

    for (let [typeName, typeInfo] of TOKEN_TYPES) {
        let matchedString = string.match(typeInfo.regex);
        // if (matchedString == TOKEN_TYPES.BOLD_START.symbol) {

        // }
    }

    return tokens;
}

function main() {
    let filename = process.argv[2];
    console.log(JSON.stringify(readFile(filename)));
}

main();
