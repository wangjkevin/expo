/* Name: Kevin Wang
 * File: token.js
 * -----------------
 * Contains the definitions of the TokenTypeInfo and Token classes,
 * as well as a few helpful constants to be used in the lexer.
 */

// the TokenTypeInfo class is supposed to act like a "struct" in C++ or
// TypeScript or Rust. It bundles a bunch of information together about a
// token type, including its name, corresponding symbol, and the regex to detect
// this token type
export class TokenTypeInfo {
    constructor(name, symbol, regex) {
        this.name = name;  // for print-friendliness
        this.symbol = symbol;
        this.regex = regex;
    }
}

// an ""enum"" type to make it easier to refer to all the various token types.
// each token type also "maps" to a bundle of inforamtion, represented as a
// TokenTypeInfo object. Why an object rather than a JavaScript object? well,
// it's a lot to type the property names. :-)
export const TOKEN_TYPES = Object.freeze({
    HEADING_1_MARKER    : new TokenTypeInfo("HEADING_1_MARKER"    , "# "          , /^#(?!#) /                         ),  // exactly one hashtag, no hashtags after this one
    HEADING_2_MARKER    : new TokenTypeInfo("HEADING_2_MARKER"    , "## "         , /^##(?!#) /                        ),
    HEADING_3_MARKER    : new TokenTypeInfo("HEADING_3_MARKER"    , "### "        , /^###(?!#) /                       ),
    HEADING_4_MARKER    : new TokenTypeInfo("HEADING_4_MARKER"    , "#### "       , /^####(?!#) /                      ),
    HEADING_5_MARKER    : new TokenTypeInfo("HEADING_5_MARKER"    , "##### "      , /^#####(?!#) /                     ),
    HEADING_6_MARKER    : new TokenTypeInfo("HEADING_6_MARKER"    , "###### "     , /^######(?!#) /                    ),
    BOLD_START          : new TokenTypeInfo("BOLD_START"          , "**"          , /^\*\*/                            ),  // need \* instead of * since * is a regex character
    BOLD_END            : new TokenTypeInfo("BOLD_END"            , "**"          , /^\*\*/                            ),  // same idea here
    ITALIC_START        : new TokenTypeInfo("ITALIC_START"        , "_"           , /^_/                               ),  // same idea here too
    ITALIC_END          : new TokenTypeInfo("ITALIC_END"          , "_"           , /^_/                               ),
    BLOCKQUOTE_MARKER   : new TokenTypeInfo("BLOCKQUOTE_MARKER"   , "> "          , /^> /                              ),
    INLINE_CODE_START   : new TokenTypeInfo("INLINE_CODE_START"   , "`"           , /^`(?!`)/                          ),  // exactly one backtick, no backticks after this one
    INLINE_CODE_END     : new TokenTypeInfo("INLINE_CODE_END"     , "`"           , /^`(?!`)/                          ),
    LINK_TEXT_START     : new TokenTypeInfo("LINK_TEXT_START"     , "["           , /^\[/                              ),
    LINK_TEXT_END       : new TokenTypeInfo("LINK_TEXT_END"       , "]"           , /^\]/                              ),
    LINK_URL_START      : new TokenTypeInfo("LINK_URL_START"      , "("           , /^\(/                              ),
    LINK_URL_END        : new TokenTypeInfo("LINK_URL_END"        , ")"           , /^\)/                              ),
    IMAGE_MARKER        : new TokenTypeInfo("IMAGE_MARKER"        , "!"           , /^!/                               ),
    IMAGE_ALT_TEXT_START: new TokenTypeInfo("IMAGE_ALT_TEXT_START", "["           , /^\[/                              ),
    IMAGE_ALT_TEXT_END  : new TokenTypeInfo("IMAGE_ALT_TEXT_END"  , "]"           , /^\]/                              ),            
    IMAGE_URL_START     : new TokenTypeInfo("IMAGE_URL_START"     , "("           , /^\(/                              ),
    IMAGE_URL_END       : new TokenTypeInfo("IMAGE_URL_END"       , ")"           , /^\)/                              ),
    BLOCK_CODE_START    : new TokenTypeInfo("BLOCK_CODE_START"    , "```"         , /^```/                             ),
    BLOCK_CODE_END      : new TokenTypeInfo("BLOCK_CODE_END"      , "```"         , /^```/                             ),
    NEWLINE_MARKER      : new TokenTypeInfo("NEWLINE_MARKER"      , ["\r\n", "\n"], /^\r?\n/                           ),
    TEXT                : new TokenTypeInfo("TEXT"                , null          , /^(?:[^#*_>`\[\]()!\r\n]|\*(?!\*)|#(?!#{0,5} )|>(?!\s))+/),  // everything that's not a special keyword in markdown
    EOF                 : new TokenTypeInfo("EOF"                 , null          , null                               )
});

// a constant to bundle together all of the token types that have a start
// and end marker, but those marker symbols are the same, syntactically!
export const AMBGIUOUS_TOKEN_TYPES = [
    {start: TOKEN_TYPES.BOLD_START, end: TOKEN_TYPES.BOLD_END},
    {start: TOKEN_TYPES.ITALIC_START, end: TOKEN_TYPES.ITALIC_END},
    {start: TOKEN_TYPES.INLINE_CODE_START, end: TOKEN_TYPES.INLINE_CODE_END},
    {start: TOKEN_TYPES.BLOCK_CODE_START, end: TOKEN_TYPES.BLOCK_CODE_END},
];

// all the token types that have a corresponding start and end token type. we map
// end to start token types because in our lexer, as soon as we detect a certain end 
// marker, we need to be able to go back and detect its corresponding starting marker.
export const PAIRED_TOKEN_TYPES = new Map([
    [TOKEN_TYPES.BOLD_END, TOKEN_TYPES.BOLD_START],
    [TOKEN_TYPES.ITALIC_END, TOKEN_TYPES.ITALIC_START],
    [TOKEN_TYPES.INLINE_CODE_END, TOKEN_TYPES.INLINE_CODE_START],
    [TOKEN_TYPES.LINK_TEXT_END, TOKEN_TYPES.LINK_TEXT_START],
    [TOKEN_TYPES.LINK_URL_END, TOKEN_TYPES.LINK_URL_START],
    [TOKEN_TYPES.IMAGE_ALT_TEXT_END, TOKEN_TYPES.IMAGE_ALT_TEXT_START],
    [TOKEN_TYPES.IMAGE_URL_END, TOKEN_TYPES.IMAGE_URL_START],
    [TOKEN_TYPES.BLOCK_CODE_END, TOKEN_TYPES.BLOCK_CODE_START],
]);

// all the token types that are allowed inside inline code or a code block.
// we want to include this to mimic EdStem forum functionality. we also don't want to 
// convert image syntax into literal HTML in the middle of a code block, for example!
export const ALLOWED_TOKEN_TYPES_IN_CODE = [
    // the code ones are rather obvious
    // ...these are more-so here so that the lexer _doesn't_ break :P
    TOKEN_TYPES.INLINE_CODE_START,
    TOKEN_TYPES.INLINE_CODE_END,
    TOKEN_TYPES.BLOCK_CODE_START,
    TOKEN_TYPES.BLOCK_CODE_END,

    // // just like in Ed, let's allow bolding and italicizing code! :D
    // TOKEN_TYPES.BOLD_START,
    // TOKEN_TYPES.BOLD_END,
    // TOKEN_TYPES.ITALIC_START,
    // TOKEN_TYPES.ITALIC_END,

    // this is so newline characters aren't blocked
    TOKEN_TYPES.NEWLINE_MARKER,
]

// the Token class acts like a "struct": it bundles all of the important information
// we need to know about a Token, like what kind of token it is (the type), as well as 
// what it's holding (the lexeme)
export class Token {
    constructor(type, lexeme) {
        this.type = type;
        this.lexeme = lexeme;
    }
}