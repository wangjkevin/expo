import fs from "fs";
import { TokenTypeInfo, TOKEN_TYPES, AMBGIUOUS_TOKEN_TYPES, PAIRED_TOKEN_TYPES, ALLOWED_TOKEN_TYPES_IN_CODE, Token } from "./token.js"

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

function discernTokenType(matchedString, tokens, inCode, tokenType) {
    // let tokenType = null;

    let endTokenType = discernEndTokenType(matchedString, tokens);
    if (endTokenType != null) tokenType = endTokenType;

    let imageTokenType = discernImageTokenType(matchedString, tokens);
    if (imageTokenType != null) tokenType = imageTokenType;

    if (inCode && !ALLOWED_TOKEN_TYPES_IN_CODE.includes(tokenType)) {
        tokenType = TOKEN_TYPES.TEXT;
    }

    return tokenType;
}

function toggleInCodeState(tokenType, inCode) {
    if (tokenType == TOKEN_TYPES.INLINE_CODE_START || tokenType == TOKEN_TYPES.BLOCK_CODE_START) {
        inCode = true;
    }
    if (tokenType == TOKEN_TYPES.INLINE_CODE_END || tokenType == TOKEN_TYPES.BLOCK_CODE_END) {
        inCode = false;
    }

    return inCode;
}

function findToken(string, tokens, inCode) {
    // note: you can't loop over TOKEN_TYPES directly, which is why you have to cast it
    // to an array using Object.entries
    for (let [typeName, typeInfo] of Object.entries(TOKEN_TYPES)) {
        // default for now, could change in the code below
        let tokenType = typeInfo;

        let matches = string.match(typeInfo.regex);
        if (matches == null) continue;
        
        // if we're here, we have a match!

        let matchedString = matches[0];

        let discernedTokenType = discernTokenType(matchedString, tokens, inCode, tokenType);
        if (discernedTokenType != null) tokenType = discernedTokenType;

        inCode = toggleInCodeState(tokenType, inCode);

        // remove the matched characters
        let remainingString = string.slice(matchedString.length);

        // if we've reached this point, we've found a match 
        // and don't need to continue looping anymore
        return [new Token(tokenType, matchedString), remainingString, inCode];
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

    for (let i = 0; i < tokens.length; i++) {
        let token = tokens[i];
        // weird edge case: if "!" is alone, convert it to text
        if (token.type == TOKEN_TYPES.IMAGE_MARKER 
            && (i == tokens.length - 1 || tokens[i + 1].type != TOKEN_TYPES.IMAGE_ALT_TEXT_START)) {
            convertToTextType(token);
        }

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

    return tokens;
}

function merge(tokens) {
    // exception handling: there could be a possibility of 
    // 0 tokens (aka empty markdown file)
    if (tokens.length == 0) {
        return [];
    }

    let mergedTokens = [tokens[0]];
    tokens = tokens.slice(1);

    while (tokens.length > 0) {
        let mostRecentlyMergedToken = mergedTokens[mergedTokens.length - 1];
        let tokenToExamine = tokens[0];
        if (mostRecentlyMergedToken.type == TOKEN_TYPES.TEXT && tokenToExamine.type == TOKEN_TYPES.TEXT) {
            mostRecentlyMergedToken.lexeme += tokenToExamine.lexeme;
        }
        else {
            mergedTokens.push(tokenToExamine);
        }
        tokens = tokens.slice(1);
    }

    return mergedTokens;
}

export function tokenize(string) {
    let tokens = [];

    let inCode = false;
    while (string.length > 0) {
        let token;

        [token, string, inCode] = findToken(string, tokens, inCode);

        // and add our token to our tokens array
        tokens.push(token);
    }

    tokens = demote(tokens);
    tokens = merge(tokens);

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
    ];

    console.log(JSON.stringify(tokenize(string)) == JSON.stringify(expected));

    // test 4: bold start token left open
    string = "## **text** _**text2_";
    expected = [
        new Token(TOKEN_TYPES.HEADING_2_MARKER, "##"),
        new Token(TOKEN_TYPES.TEXT, " "),
        new Token(TOKEN_TYPES.BOLD_START, "**"),
        new Token(TOKEN_TYPES.TEXT, "text"),
        new Token(TOKEN_TYPES.BOLD_END, "**"),
        new Token(TOKEN_TYPES.TEXT, " "),
        new Token(TOKEN_TYPES.ITALIC_START, "_"),
        new Token(TOKEN_TYPES.TEXT, "**text2"),  // DEMOTED!
        new Token(TOKEN_TYPES.ITALIC_END, "_"),
    ];
    console.log(JSON.stringify(tokenize(string)) == JSON.stringify(expected));

    // test 5: test all markdown syntax
    string = readFile("test_files/everything.md");
    expected = [
        new Token(TOKEN_TYPES.HEADING_1_MARKER, "#"),
        new Token(TOKEN_TYPES.TEXT, " heading 1"),
        new Token(TOKEN_TYPES.NEWLINE_MARKER, "\r\n"),
        new Token(TOKEN_TYPES.HEADING_2_MARKER, "##"),
        new Token(TOKEN_TYPES.TEXT, " heading 2"),
        new Token(TOKEN_TYPES.NEWLINE_MARKER, "\r\n"),
        new Token(TOKEN_TYPES.HEADING_3_MARKER, "###"),
        new Token(TOKEN_TYPES.TEXT, " heading 3"),
        new Token(TOKEN_TYPES.NEWLINE_MARKER, "\r\n"),
        new Token(TOKEN_TYPES.HEADING_4_MARKER, "####"),
        new Token(TOKEN_TYPES.TEXT, " heading 4"),
        new Token(TOKEN_TYPES.NEWLINE_MARKER, "\r\n"),
        new Token(TOKEN_TYPES.HEADING_5_MARKER, "#####"),
        new Token(TOKEN_TYPES.TEXT, " heading 5"),
        new Token(TOKEN_TYPES.NEWLINE_MARKER, "\r\n"),
        new Token(TOKEN_TYPES.HEADING_6_MARKER, "######"),
        new Token(TOKEN_TYPES.TEXT, " heading 6"),
        new Token(TOKEN_TYPES.NEWLINE_MARKER, "\r\n"),
        new Token(TOKEN_TYPES.NEWLINE_MARKER, "\r\n"),
        new Token(TOKEN_TYPES.BOLD_START, "**"),
        new Token(TOKEN_TYPES.TEXT, "bold"),
        new Token(TOKEN_TYPES.BOLD_END, "**"),
        new Token(TOKEN_TYPES.NEWLINE_MARKER, "\r\n"),
        new Token(TOKEN_TYPES.NEWLINE_MARKER, "\r\n"),
        new Token(TOKEN_TYPES.ITALIC_START, "_"),
        new Token(TOKEN_TYPES.TEXT, "italicized"),
        new Token(TOKEN_TYPES.ITALIC_END, "_"),
        new Token(TOKEN_TYPES.NEWLINE_MARKER, "\r\n"),
        new Token(TOKEN_TYPES.NEWLINE_MARKER, "\r\n"),
        new Token(TOKEN_TYPES.BLOCKQUOTE_MARKER, ">"),
        new Token(TOKEN_TYPES.TEXT, " here's a blockquote"),
        new Token(TOKEN_TYPES.NEWLINE_MARKER, "\r\n"),
        new Token(TOKEN_TYPES.NEWLINE_MARKER, "\r\n"),
        new Token(TOKEN_TYPES.INLINE_CODE_START, "`"),
        new Token(TOKEN_TYPES.TEXT, "function tokenize(string) { ... }"),  // !!!
        new Token(TOKEN_TYPES.INLINE_CODE_END, "`"),
        new Token(TOKEN_TYPES.NEWLINE_MARKER, "\r\n"),
        new Token(TOKEN_TYPES.NEWLINE_MARKER, "\r\n"),
        new Token(TOKEN_TYPES.LINK_TEXT_START, "["),
        new Token(TOKEN_TYPES.TEXT, "here's a link"),
        new Token(TOKEN_TYPES.LINK_TEXT_END, "]"),
        new Token(TOKEN_TYPES.LINK_URL_START, "("),
        new Token(TOKEN_TYPES.TEXT, "youtube.com"),
        new Token(TOKEN_TYPES.LINK_URL_END, ")"),
        new Token(TOKEN_TYPES.NEWLINE_MARKER, "\r\n"),
        new Token(TOKEN_TYPES.NEWLINE_MARKER, "\r\n"),
        new Token(TOKEN_TYPES.IMAGE_MARKER, "!"),
        new Token(TOKEN_TYPES.IMAGE_ALT_TEXT_START, "["),
        new Token(TOKEN_TYPES.TEXT, "here's an image"),
        new Token(TOKEN_TYPES.IMAGE_ALT_TEXT_END, "]"),
        new Token(TOKEN_TYPES.IMAGE_URL_START, "("),
        new Token(TOKEN_TYPES.TEXT, "https://img.pastemagazine.com/wp-content/avuploads/2022/11/15002949/f164158d408e025d130041f82e3399f6.jpg"),
        new Token(TOKEN_TYPES.IMAGE_URL_END, ")"),
        new Token(TOKEN_TYPES.NEWLINE_MARKER, "\r\n"),
        new Token(TOKEN_TYPES.NEWLINE_MARKER, "\r\n"),
        new Token(TOKEN_TYPES.BLOCK_CODE_START, "```"),
        new Token(TOKEN_TYPES.NEWLINE_MARKER, "\r\n"),
        new Token(TOKEN_TYPES.TEXT, "function tokenize(string) {"),
        new Token(TOKEN_TYPES.NEWLINE_MARKER, "\r\n"),
        new Token(TOKEN_TYPES.TEXT, "    ..."),
        new Token(TOKEN_TYPES.NEWLINE_MARKER, "\r\n"),
        new Token(TOKEN_TYPES.TEXT, "}"),
        new Token(TOKEN_TYPES.NEWLINE_MARKER, "\r\n"),
        new Token(TOKEN_TYPES.BLOCK_CODE_END, "```"),
        new Token(TOKEN_TYPES.NEWLINE_MARKER, "\r\n"),
        new Token(TOKEN_TYPES.NEWLINE_MARKER, "\r\n"),
        new Token(TOKEN_TYPES.TEXT, "and here's some text to end this file"),
    ];
    console.log(JSON.stringify(tokenize(string)) == JSON.stringify(expected));

    string = readFile("test_files/tiny_finale.md");
    expected = [
        new Token(TOKEN_TYPES.HEADING_1_MARKER, "#"),
        new Token(TOKEN_TYPES.TEXT, " Extra Practice Problems! 🎯"),
        new Token(TOKEN_TYPES.NEWLINE_MARKER, "\r\n"),
        new Token(TOKEN_TYPES.NEWLINE_MARKER, "\r\n"),
        new Token(TOKEN_TYPES.TEXT, "Hi scholars! As we near the final, I wanted to give you all more opportunities to practice your CS106B skillz! At its heart, computer science can be described as the study of games. Hence, these problems are all game-themed! I hope you enjoy, and I hope you'll try out one of these games--perhaps now, or after the final!"),
        new Token(TOKEN_TYPES.NEWLINE_MARKER, "\r\n"),
        new Token(TOKEN_TYPES.NEWLINE_MARKER, "\r\n"),
        new Token(TOKEN_TYPES.HEADING_2_MARKER, "##"),
        new Token(TOKEN_TYPES.TEXT, "You’ve probably heard of it: the notorious Connections puzzle, infamously crafted by puzzle creator Wyna Liu and released daily by the New York Times. In Connections, your goal is to form four groups of four items each, where each group shares something in common. There’s always exactly one solution for each puzzle, and each group is more difficult than the previous. If you haven’t played this game before, try solving today’s puzzle! Chances are it’s not that easy. This experience of frustration will form the backbone of this problem. >:-)"),
        new Token(TOKEN_TYPES.NEWLINE_MARKER, "\r\n"),
        new Token(TOKEN_TYPES.NEWLINE_MARKER, "\r\n"),
        new Token(TOKEN_TYPES.TEXT, "Doom (1993) is one of those canonical video games that completely transfigured the video game landscape. It’s considered the first first-person shooter (FPS), and it revolutionized the development of game engines, as well as set up the form of the FPS (just like the structure of a novel) that would reverberate throughout every FPS game out there, like Valorant or CS:GO."),
        new Token(TOKEN_TYPES.NEWLINE_MARKER, "\r\n"),
        new Token(TOKEN_TYPES.NEWLINE_MARKER, "\r\n"),
        new Token(TOKEN_TYPES.TEXT, "(this is a snippet of the CS106B finale practice problems)"),
    ];
    console.log(tokenize(string));
    console.log(JSON.stringify(tokenize(string)) == JSON.stringify(expected));
}

main();
