import fs from "fs";
import { TokenTypeInfo, TOKEN_TYPES, AMBGIUOUS_TOKEN_TYPES, PAIRED_TOKEN_TYPES, ALLOWED_TOKEN_TYPES_IN_CODE, Token } from "./token.js";

export function readFile(filename) {
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

    if (tokenType == TOKEN_TYPES.LINK_URL_START 
        && tokens[tokens.length - 1]?.type != TOKEN_TYPES.LINK_TEXT_END
        && tokens[tokens.length - 1]?.type != TOKEN_TYPES.IMAGE_ALT_TEXT_END
    ) {
        tokenType = TOKEN_TYPES.TEXT;
    }

    if (tokenType == TOKEN_TYPES.LINK_URL_END 
        && findMostRecentTokenType(tokens, [TOKEN_TYPES.LINK_URL_START, TOKEN_TYPES.IMAGE_URL_START]) == null
    ) {
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
    while (stack.length > 0 && stack[stack.length - 1].type != PAIRED_TOKEN_TYPES.get(currentEndToken.type)) {
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

        if (token.type == TOKEN_TYPES.LINK_TEXT_END 
            && (i == tokens.length - 1 || tokens[i + 1].type != TOKEN_TYPES.LINK_URL_START)) {
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

function addEOFToken(tokens) {
    tokens.push(new Token(TOKEN_TYPES.EOF, null));
    return tokens;
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
    tokens = addEOFToken(tokens);

    return tokens;
}