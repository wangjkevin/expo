/* Name: Kevin Wang
 * File: lexer.js
 * -------------------
 * Converts Markdown into an array of Tokens.
 */

import fs from "fs";
import { TokenTypeInfo, TOKEN_TYPES, AMBGIUOUS_TOKEN_TYPES, PAIRED_TOKEN_TYPES, ALLOWED_TOKEN_TYPES_IN_CODE, Token } from "./token.js";

// readFile takes in one argument, filename (string), and returns
// the contents of the file as a string
export function readFile(filename) {
    return fs.readFileSync(filename, "utf8");
}

// discernEndTokenType takes in two arguments:
//     - matchedString (string)
//     - tokens (an array of Tokens)
// and figures out whether the matchedString is a starting or ending
// symbol. if it's an ending symbol, then there _must_ be a starting symbol
// somewhere before, which is where we start searching through the tokens array.
// otherwise, it's a starting token.
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

// findMostRecentTokenType takes in two arguments:
//     - tokens (an array of Tokens)
//     - candidates (an array of TokenTypeInfos)
// and returns the type of the token that is the most recent token type in candidates
// in tokens
function findMostRecentTokenType(tokens, candidates) {
    // to find the most recent token type, we loop _backwards_ in the array
    for (let i = tokens.length - 1; i >= 0; i--) {
        if (candidates.includes(tokens[i].type)) {
            return tokens[i].type;
        }
    }

    return null;
}

// discernImageTokenType takes in two aruments:
//     - matchedString (string)
//     - tokens (an array of Tokens)
// and returns the type of the matchedString. there are multiple different
// image token types, so we'll need to look at what we've tokenized already
// to infer what type matchedString is
function discernImageTokenType(matchedString, tokens) {
    // no tokens? return immediately
    if (tokens.length == 0) return null;

    // if matchedString is [, we check before us. if there's a !, 
    // we know it must be the start of an image's alt text
    if (matchedString == TOKEN_TYPES.LINK_TEXT_START.symbol 
        && tokens[tokens.length - 1].type == TOKEN_TYPES.IMAGE_MARKER) {
        return TOKEN_TYPES.IMAGE_ALT_TEXT_START;
    }

    // if matchedString is ], we check in our tokens list and see if
    // we already have another image alt text symbol [. if so, we know this
    // string must be the end of an image's alt text
    if (matchedString == TOKEN_TYPES.LINK_TEXT_END.symbol
        && TOKEN_TYPES.IMAGE_ALT_TEXT_START == findMostRecentTokenType(tokens, [TOKEN_TYPES.IMAGE_ALT_TEXT_START, TOKEN_TYPES.LINK_TEXT_START])) {
        return TOKEN_TYPES.IMAGE_ALT_TEXT_END;
    }

    // if matchedString is (, we check the very last token and see if it is the end
    // of an image's alt text, ]. if it is, we know this must be the start of the
    // image's URL
    if (matchedString == TOKEN_TYPES.LINK_URL_START.symbol 
        && tokens[tokens.length - 1].type == TOKEN_TYPES.IMAGE_ALT_TEXT_END) {
        return TOKEN_TYPES.IMAGE_URL_START;
    }

    // if matchedString is ), we check in our tokens list and see if we already
    // have another image URL symbol (. if so, we know this string must be
    // the end of an image's URL
    if (matchedString == TOKEN_TYPES.LINK_URL_END.symbol
        && TOKEN_TYPES.IMAGE_URL_START == findMostRecentTokenType(tokens, [TOKEN_TYPES.IMAGE_URL_START, TOKEN_TYPES.LINK_URL_START])) {
        return TOKEN_TYPES.IMAGE_URL_END;
    }

    return null;
}

// discernTextTokenType takes in three arguments:
//     - inCode (bool)
//     - tokens (an array of Tokens)
//     - tokenType (TokenTypeInfo)
// and returns the text token type if the tokenType we're currently on
// should be converted into a text token, or null otherwise.
function discernTextTokenType(inCode, tokens, tokenType) {
    // we convert the token type to text with the three following rules:
    //   (1) we're inside code (whether inline or block), and the token type
    //       is not one of the allowed token types inside code
    if (inCode && !ALLOWED_TOKEN_TYPES_IN_CODE.includes(tokenType)) {
        return TOKEN_TYPES.TEXT;
    }

    //   (2) the token type thinks it's the start of a link URL, but there is no
    //       ending square bracket immediately before it
    if (tokenType == TOKEN_TYPES.LINK_URL_START 
        && tokens[tokens.length - 1]?.type != TOKEN_TYPES.LINK_TEXT_END
        && tokens[tokens.length - 1]?.type != TOKEN_TYPES.IMAGE_ALT_TEXT_END
    ) {
        return TOKEN_TYPES.TEXT;
    }

    //   (3) the token type thinks it's the end of a link URL, but there is no
    //       link opener, i.e. (, before it in our array of Tokens
    if (tokenType == TOKEN_TYPES.LINK_URL_END 
        && findMostRecentTokenType(tokens, [TOKEN_TYPES.LINK_URL_START, TOKEN_TYPES.IMAGE_URL_START]) == null
    ) {
        return TOKEN_TYPES.TEXT;
    }

    // otherwise, we return null since there's nothing to convert
    return null;
}

// discernTokenType takes in four arguments:
//     - matchedString (string)
//     - tokens (an array of Tokens)
//     - inCode (bool)
//     - tokenType (TokenTypeInfo)
// and discerns the token type for strings that may need some extra care.
// this is because some token types should be converted into other token types.
// think of this is a wrapper function: take a look at the function headers for the
// helper functions called inside this function for more info! :)
function discernTokenType(matchedString, tokens, inCode, tokenType) {
    let endTokenType = discernEndTokenType(matchedString, tokens);
    if (endTokenType != null) tokenType = endTokenType;

    let imageTokenType = discernImageTokenType(matchedString, tokens);
    if (imageTokenType != null) tokenType = imageTokenType;

    let textTokenType = discernTextTokenType(inCode, tokens, tokenType);
    if (textTokenType != null) tokenType = textTokenType;

    return tokenType;
}

// toggleInCodeState takes in two arguments:
//     - tokenType (TokenTypeInfo)
//     - inCode (bool)
// and returns an updated value of inCode. inCode should be updated to true
// if we're inside inline code or a code block, and inCode should be updated
// to false if we're at the end of inline code or a code block. otherwise, 
// it should remain the same value as it was before
function toggleInCodeState(tokenType, inCode) {
    if (tokenType == TOKEN_TYPES.INLINE_CODE_START || tokenType == TOKEN_TYPES.BLOCK_CODE_START) {
        inCode = true;
    }
    if (tokenType == TOKEN_TYPES.INLINE_CODE_END || tokenType == TOKEN_TYPES.BLOCK_CODE_END) {
        inCode = false;
    }

    return inCode;
}

// findToken takes in three arguments:
//     - string (string)
//     - tokens (an array of Tokens)
//     - inCode (bool)
// and finds a token at the beginning of the string (depending on what
// token type regex matches), then adds this token to tokens! 
// note: we need the argument inCode in order to discern the correct token type,
// as some tokens need some extra parsing before appending it to tokens
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

// isStartToken takes in one argument, token (Token), and returns
// true if it's a start token (i.e. a starting bold token, a starting inline code 
// token, etc.), and false otherwise
function isStartToken(token) {
    return [...PAIRED_TOKEN_TYPES.values()].includes(token.type);
}

// isEndToken takes in one argument, token (Token), and returns
// true if it's an ending token (i.e. an ending bold token, an ending inline code 
// token, etc.), and false otherwise
function isEndToken(token) {
    return [...PAIRED_TOKEN_TYPES.keys()].includes(token.type);
}

// demoteUntilStartTokenFound takes in two arguments:
//     - stack (array, but mimics a stack, since JavaScript doesn't have a stack type!) 
//     - currentEndToken
// and pops off every token in the stack until the token's type at the top of the stack
// matches the currentEndToken type. every token that is popped off in this process
// is automatically demoted to a text token. the stack only holds paired tokens, so
// any tokens that are popped off in this process are tokens that do not have a corresponding
// starting/end token. this means that they are unpaired, and so should be interpreted
// as text tokens
function demoteUntilStartTokenFound(stack, currentEndToken) {
    while (stack.length > 0 && stack[stack.length - 1].type != PAIRED_TOKEN_TYPES.get(currentEndToken.type)) {
        let tokenToDemote = stack.pop();

        if (tokenToDemote.type != TOKEN_TYPES.TEXT) {
            convertToTextType(tokenToDemote);
        }
    }
}

// convertToTextType takes in one argument, token (Token), and
// sets its type to text
function convertToTextType(token) {
    token.type = TOKEN_TYPES.TEXT;
}

// demoteLeftoverTokens takes in one argument, stack (array), and
// converts every token in this array to a text token
function demoteLeftoverTokens(stack) {
    for (let token of stack) {
        convertToTextType(token);
    }
}

// demote takes in one argument, tokens (an array of Tokens), and
// runs through the tokens array, turning any tokens that are "corrupted" to text tokens.
// by "corrupted", we mean unpaired tokens: image alt text tokens that are missing 
// an image marker, bold starting tokens that are missing their corresponding end tokens, etc.
// this function works by maintaining a stack of starting and end tokens. as we loop
// through the tokens array and detect that we have a starting/end token, we push it onto
// the stack. note that text tokens are not included in this stack! as soon as we detect 
// the corresponding end token, we continuously pop tokens of the stack until we find the 
// start token (see demoteUntilStartTokenFound's header comment for more info). then,
// we pop off any remaining tokens on the stack after we're done looping, since we know
// for a fact that those tokens are unpaired. demoting tokens allows us to type parenthese
// (like this) as well as smiley faces! :-)
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

    demoteLeftoverTokens(stack);

    return tokens;
}

// merge takes in one argument, tokens (array of Tokens), and returns
// a array with all neighboring text tokens merged. for example, if
// there were four text tokens all side by side in the tokens array,
// these four text tokens would be merged into a singular text token,
// with their lexemes appropriately concatenated together inside this
// one text token. we need this function to make later steps of the 
// Markdown to HTML generation easier. it makes the syntax tree smaller 
// (meaning less parsing time), and it simplifies the resulting HTMl code
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

// addEOFToken takes in one argument, tokens (array of Tokens), and returns
// the tokens array with a end-of-file (EOF) token appended to the end of it
// to signal the end of the Markdown file 
function addEOFToken(tokens) {
    tokens.push(new Token(TOKEN_TYPES.EOF, null));
    return tokens;
}

// the main event! tokenize takes in one argument, string (string), and returns
// a tokenized version of the string. after we loop through every token and append
// each token to our tokens array, we still have to do some cleaning. we have to make
// sure that all tokens have the appropriate types, the tokens array is as tight as
// it can be, and that the tokens array ends with an EOF token to make parsing this
// array while generating the syntax tree easier
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