import fs from "fs";
import { TokenTypeInfo, TOKEN_TYPES, Token } from "./token.js"

function readFile(filename) {
    return fs.readFileSync(filename, "utf8");
}



function tokenize(string) {
    let tokens = [];


    while (string.length > 0) {
        console.log(string.length);
        // note: you can't loop over TOKEN_TYPES directly, which is why you have to cast it
        // to an array using Object.entries
        for (let [typeName, typeInfo] of Object.entries(TOKEN_TYPES)) {
            // console.log(`LOOPING OVER ${[typeName, JSON.stringify(typeInfo)]}`)

            // default for now, could change in the code below
            let tokenType = typeInfo;

            let matches = string.match(typeInfo.regex);
            if (matches == null) {
                continue;
            }
            
            let matchedString = matches[0];
            if (matchedString == TOKEN_TYPES.BOLD_START.symbol) {
                // STEP 1: first, we have to decide: is this a start or end symbol?
                // to accomplish this, we loop _backwards_ in the array
                for (let i = tokens.length - 1; i >= 0; i--) {
                    if (tokens[i].type == TOKEN_TYPES.BOLD_START) {
                        // if we're here, then we know that the matched string is an end symbol
                        tokenType = TOKEN_TYPES.BOLD_END;
                    }
                    else if (tokens[i].type == TOKEN_TYPES.BOLD_END) {
                        // otherwise, we know that the matched string is a start symbol
                        tokenType = TOKEN_TYPES.BOLD_START;
                    }
                }
            }

            // remove the matched characters
            string = string.slice(matchedString.length);

            // now append this new token into our tokens array
            tokens.push(
                new Token(tokenType, matchedString)
            );

            break;
        }
    }


    return tokens;
}

function main() {
    let filename = process.argv[2];
    console.log(JSON.stringify(readFile(filename)));

    // test 1
    let string = "# some **bolded** text\r\n";
    let expected = [
        new Token(TOKEN_TYPES.HEADING_1_MARKER, "#"),
        new Token(TOKEN_TYPES.TEXT, " some "),
        new Token(TOKEN_TYPES.BOLD_START, "**"),
        new Token(TOKEN_TYPES.TEXT, "bolded"),
        new Token(TOKEN_TYPES.BOLD_END, "**"),
        new Token(TOKEN_TYPES.TEXT, " text"),
        new Token(TOKEN_TYPES.NEWLINE_MARKER, "\r\n"),
    ];

    let result = tokenize(string);

    console.log(JSON.stringify(result) == JSON.stringify(expected));

    // test 2
    string = "### This is some **bolded** and _italicized_ text with some `code` and ```block code```\r\n";
    expected = [
        new Token(TOKEN_TYPES.HEADING_3_MARKER, "###"),
        new Token(TOKEN_TYPES.TEXT, " This is some "),
        new Token(TOKEN_TYPES.BOLD_START, "**"),
        new Token(TOKEN_TYPES.TEXT, "bolded"),
        new Token(TOKEN_TYPES.BOLD_END, "**"),
        new Token(TOKEN_TYPES.TEXT, " and "),
        new Token(TOKEN_TYPES.ITALIC_START, "_"),
        new Token(TOKEN_TYPES.TEXT, "italicized"),
        new Token(TOKEN_TYPES.ITALIC_END, "_"),
        new Token(TOKEN_TYPES.TEXT, " text with some "),
        new Token(TOKEN_TYPES.INLINE_CODE_START, "`"),
        new Token(TOKEN_TYPES.TEXT, "code"),
        new Token(TOKEN_TYPES.INLINE_CODE_END, "`"),
        new Token(TOKEN_TYPES.TEXT, " and "),
        new Token(TOKEN_TYPES.BLOCK_CODE_START, "```"),
        new Token(TOKEN_TYPES.TEXT, "block code"),
        new Token(TOKEN_TYPES.BLOCK_CODE_END, "```"),
        new Token(TOKEN_TYPES.NEWLINE_MARKER, "\r\n"),
    ];
    console.log(JSON.stringify(tokenize(string), null, 2))
    console.log(JSON.stringify(tokenize(string)) == JSON.stringify(expected));
}

main();
