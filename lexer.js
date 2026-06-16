import { Token, TokenType } from "./token.js"

function readFile(filename) {
    const fs = require("fs");

    return fs.readFileSync(filename, "utf8");
}

function tokenize(file) {
    
}

function main() {
    let filename = process.argv[2];
    console.log(JSON.stringify(readFile(filename)));
}

main();
