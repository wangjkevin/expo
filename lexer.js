import fs from "fs";
import { TokenName, TokenType, Token, TOKEN_TYPES } from "./token.js"

function readFile(filename) {
    return fs.readFileSync(filename, "utf8");
}

function tokenize(string) {

}

function main() {
    let filename = process.argv[2];
    console.log(JSON.stringify(readFile(filename)));
}

main();
