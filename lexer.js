import fs from "fs";
import { TokenTypeInfo, TOKEN_TYPES, PAIRED_TOKEN_TYPES, Token } from "./token.js"

function readFile(filename) {
    return fs.readFileSync(filename, "utf8");
}

function discernEndTokenType(matchedString, tokens) {
    for (let tokenPair of PAIRED_TOKEN_TYPES) {
        if (matchedString == tokenPair.start.symbol) {
            // first, we have to decide: is this a start or end symbol?
            // to accomplish this, we loop _backwards_ in the array
            for (let i = tokens.length - 1; i >= 0; i--) {
                if (tokens[i].type == tokenPair.start) {
                    // if we're here, then we know that the matched string is an end symbol
                    return tokenPair.end;
                }
            }
        }    
    }

    return null;
}

function findToken(string, tokens) {
    // note: you can't loop over TOKEN_TYPES directly, which is why you have to cast it
    // to an array using Object.entries
    for (let [typeName, typeInfo] of Object.entries(TOKEN_TYPES)) {
        // default for now, could change in the code below
        let tokenType = typeInfo;

        let matches = string.match(typeInfo.regex);
        if (matches == null) continue;
        
        let matchedString = matches[0];

        let endTokenType = discernEndTokenType(matchedString, tokens);
        if (endTokenType != null) tokenType = endTokenType;

        // remove the matched characters
        let remainingString = string.slice(matchedString.length);

        // if we've reached this point, we've found a match 
        // and don't need to continue looping anymore
        return [new Token(tokenType, matchedString), remainingString];
    }
}

function tokenize(string) {
    let tokens = [];


    while (string.length > 0) {
        let [token, remainingString] = findToken(string, tokens);

        // left-trim the string
        string = remainingString;

        // and add our token to our tokens array
        tokens.push(token);
    }


    return tokens;
}

function main() {
    let filename = process.argv[2];
    // console.log(JSON.stringify(readFile(filename)));

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
    // console.log(`RESULT: ${JSON.stringify(tokenize(string), null, 2)}`);
    // console.log(`EXPECTED: ${JSON.stringify(expected, null, 2)}`);
    console.log(JSON.stringify(tokenize(string)) == JSON.stringify(expected));

    // test 3
    string = "[here's a link](google.com) and ![here's an image](test)\n";
    expected = [
        new Token(TOKEN_TYPES.LINK_TEXT_START, "["),
        new Token(TOKEN_TYPES.TEXT, "here's a link"),
        new Token(TOKEN_TYPES.LINK_TEXT_END, "]"),
        new Token(TOKEN_TYPES.LINK_URL_START, "("),
        new Token(TOKEN_TYPES.TEXT, "google.com"),
        new Token(TOKEN_TYPES.LINK_URL_END, ")"),
        new Token(TOKEN_TYPES.TEXT," and "),
        new Token(TOKEN_TYPES.IMAGE_MARKER, "!"),
        new Token(TOKEN_TYPES.IMAGE_ALT_TEXT_START, "["),
        new Token(TOKEN_TYPES.TEXT, "here's an image"),
        new Token(TOKEN_TYPES.IMAGE_ALT_TEXT_END, "]"),
        new Token(TOKEN_TYPES.IMAGE_URL_START, "("),
        new Token(TOKEN_TYPES.TEXT, "test"),
        new Token(TOKEN_TYPES.IMAGE_URL_END, ")"),
        new Token(TOKEN_TYPES.NEWLINE_MARKER, "\n")
    ]
    console.log(JSON.stringify(tokenize(string), null, 2))
    console.log(JSON.stringify(tokenize(string)) == JSON.stringify(expected));
}

main();
