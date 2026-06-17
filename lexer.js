import fs from "fs";
import { TokenTypeInfo, TOKEN_TYPES, AMBGIUOUS_TOKEN_TYPES, PAIRED_TOKEN_TYPES, Token } from "./token.js"

function readFile(filename) {
    return fs.readFileSync(filename, "utf8");
}

function discernEndTokenType(matchedString, tokens) {
    for (let tokenPair of AMBGIUOUS_TOKEN_TYPES) {
        if (matchedString == tokenPair.start.symbol) {
            // we have to decide: is this a start or end symbol?
            let foundTokenType = findMostRecentTokenType(tokens, Object.values(tokenPair));
            if (foundTokenType == tokenPair.start) {
                return tokenPair.end;
            }
            else if (foundTokenType == tokenPair.end) {
                return tokenPair.start;
            }
        }    
    }

    return null;
}

function findMostRecentTokenType(tokens, candidates) {
    // to find the most recent token type, we loop _backwards_ in the array
    for (let i = tokens.length - 1; i >= 0; i--) {
        if (candidates.includes(tokens[i].type)) {
            return tokens[i].type;
        }
    }

    return null;
}

function discernImageTokenType(matchedString, tokens) {
    if (tokens.length == 0) return null;

    if (matchedString == TOKEN_TYPES.LINK_TEXT_START.symbol 
        && tokens[tokens.length - 1].type == TOKEN_TYPES.IMAGE_MARKER) {
        return TOKEN_TYPES.IMAGE_ALT_TEXT_START;
    }
    if (matchedString == TOKEN_TYPES.LINK_TEXT_END.symbol
        && TOKEN_TYPES.IMAGE_ALT_TEXT_START == findMostRecentTokenType(tokens, [TOKEN_TYPES.IMAGE_ALT_TEXT_START, TOKEN_TYPES.LINK_TEXT_START])) {
        return TOKEN_TYPES.IMAGE_ALT_TEXT_END;
    }
    if (matchedString == TOKEN_TYPES.LINK_URL_START.symbol 
        && tokens[tokens.length - 1].type == TOKEN_TYPES.IMAGE_ALT_TEXT_END) {
        return TOKEN_TYPES.IMAGE_URL_START;
    }
    if (matchedString == TOKEN_TYPES.LINK_URL_END.symbol
        && TOKEN_TYPES.IMAGE_URL_START == findMostRecentTokenType(tokens, [TOKEN_TYPES.IMAGE_URL_START, TOKEN_TYPES.LINK_URL_START])) {
        return TOKEN_TYPES.IMAGE_URL_END;
    }

    return null;
}

function discernTokenType(matchedString, tokens) {
    let tokenType = null;

    let endTokenType = discernEndTokenType(matchedString, tokens);
    if (endTokenType != null) tokenType = endTokenType;

    let imageTokenType = discernImageTokenType(matchedString, tokens);
    if (imageTokenType != null) tokenType = imageTokenType;

    return tokenType;
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

        let discernedTokenType = discernTokenType(matchedString, tokens);
        if (discernedTokenType != null) tokenType = discernedTokenType;

        // remove the matched characters
        let remainingString = string.slice(matchedString.length);

        // if we've reached this point, we've found a match 
        // and don't need to continue looping anymore
        return [new Token(tokenType, matchedString), remainingString];
    }
}

function isStartToken(token) {
    return [...PAIRED_TOKEN_TYPES.values()].includes(token.type);
}

function isEndToken(token) {
    return [...PAIRED_TOKEN_TYPES.keys()].includes(token.type);
}

function demoteUntilStartTokenFound(stack, currentEndToken) {
    while (stack[stack.length - 1].type != PAIRED_TOKEN_TYPES.get(currentEndToken.type)) {
        let tokenToDemote = stack.pop();

        if (tokenToDemote.type != TOKEN_TYPES.TEXT) {
            convertToTextType(tokenToDemote);
        }
    }
}

function convertToTextType(token) {
    token.type = TOKEN_TYPES.TEXT;
}

function demote(tokens) {
    let stack = [];

    for (let token of tokens) {
        // is the token a start token?
        if (isStartToken(token)) {
            // if so, push it onto the stack!
            stack.push(token);
        }
        // is the token an end token?
        else if (isEndToken(token)) {
            // if so, continue popping from the stack and demoting 
            // tokens until we find its true partner: the corresponding start token,
            // or until the stack is empty :-)
            demoteUntilStartTokenFound(stack, token);

            // pop the start token
            if (stack.length > 0) {
                stack.pop();
            }
        }
    }

    for (let token of stack) {
        token.type = TOKEN_TYPES.TEXT;
    }
}

export function tokenize(string) {
    let tokens = [];

    while (string.length > 0) {
        let [token, remainingString] = findToken(string, tokens);

        // left-trim the string
        string = remainingString;

        // and add our token to our tokens array
        tokens.push(token);
    }

    demote(tokens);

    return tokens;
}

function main() {
    let filename = process.argv[2];

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
    console.log(JSON.stringify(tokenize(string)) == JSON.stringify(expected));

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
    console.log(JSON.stringify(tokenize(string)) == JSON.stringify(expected));

    // console.log(JSON.stringify(tokenize("# **text** _**code_ "), null, 2))
}

main();
