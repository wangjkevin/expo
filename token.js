export const TokenName = Object.freeze({
    HEADING_1_MARKER: "HEADING_1_MARKER",
    HEADING_2_MARKER: "HEADING_2_MARKER",
    HEADING_3_MARKER: "HEADING_3_MARKER",
    HEADING_4_MARKER: "HEADING_4_MARKER",
    HEADING_5_MARKER: "HEADING_5_MARKER",
    HEADING_6_MARKER: "HEADING_6_MARKER",
    BOLD_START: "BOLD_START",
    BOLD_END: "BOLD_END",
    ITALIC_START: "ITALIC_START",
    ITALIC_END: "ITALIC_END",
    BLOCKQUOTE_MARKER: "BLOCKQUOTE_MARKER",
    INLINE_CODE_START: "INLINE_CODE_START",
    INLINE_CODE_END: "INLINE_CODE_END",
    LINK_TEXT_START: "LINK_TEXT_START",
    LINK_TEXT_END: "LINK_TEXT_END",
    LINK_URL_START: "LINK_URL_START",
    LINK_URL_END: "LINK_URL_END",
    IMAGE_MARKER: "IMAGE_MARKER",
    IMAGE_ALT_TEXT_START: "IMAGE_ALT_TEXT_START",
    IMAGE_ALT_TEXT_END: "IMAGE_ALT_TEXT_END",
    IMAGE_URL_START: "IMAGE_URL_START",
    IMAGE_URL_END: "IMAGE_URL_END",
    BLOCK_CODE_START: "BLOCK_CODE_START",
    BLOCK_CODE_END: "BLOCK_CODE_END",
    NEWLINE_MARKER: "NEWLINE_MARKER",
    TEXT: "TEXT",
})

export class TokenType {
    constructor(name, symbol, regex) {
        this.name = name;
        this.symbol = symbol;
        this.regex = regex;
    }
}

export class Token {
    constructor(type, lexeme) {
        this.type = type;
        this.lexeme = lexeme;
    }
}

export const TOKEN_TYPES = [
    new TokenType(TokenName.HEADING_1_MARKER    , "#"     , /^#/                   ),
    new TokenType(TokenName.HEADING_2_MARKER    , "##"    , /^##/                  ),
    new TokenType(TokenName.HEADING_3_MARKER    , "###"   , /^###/                 ),
    new TokenType(TokenName.HEADING_4_MARKER    , "####"  , /^####/                ),
    new TokenType(TokenName.HEADING_5_MARKER    , "#####" , /^#####/               ),
    new TokenType(TokenName.HEADING_6_MARKER    , "######", /^######/              ),
    new TokenType(TokenName.BOLD_START          , "**"    , /^\*\*/                ),  // need \* instead of * since * is a regex character
    new TokenType(TokenName.BOLD_END            , "**"    , /^\*\*/                ),  // same idea here
    new TokenType(TokenName.ITALIC_START        , "_"     , /^_/                   ),  // same idea here too
    new TokenType(TokenName.ITALIC_END          , "_"     , /^_/                   ),
    new TokenType(TokenName.BLOCKQUOTE_MARKER   , ">"     , /^>/                   ),
    new TokenType(TokenName.INLINE_CODE_START   , "`"     , /^`/                   ),
    new TokenType(TokenName.INLINE_CODE_END     , "`"     , /^`/                   ),
    new TokenType(TokenName.LINK_TEXT_START     , "["     , /^\[/                  ),
    new TokenType(TokenName.LINK_TEXT_END       , "]"     , /^\]/                  ),
    new TokenType(TokenName.LINK_URL_START      , "("     , /^\(/                  ),
    new TokenType(TokenName.LINK_URL_END        , ")"     , /^\)/                  ),
    new TokenType(TokenName.IMAGE_MARKER        , "!"     , /^!/                   ),
    new TokenType(TokenName.IMAGE_ALT_TEXT_START, "["     , /^\[/                  ),
    new TokenType(TokenName.IMAGE_ALT_TEXT_END  , "]"     , /^\]/                  ),
    new TokenType(TokenName.IMAGE_URL_START     , "("     , /^\(/                  ),
    new TokenType(TokenName.IMAGE_URL_END       , ")"     , /^\)/                  ),
    new TokenType(TokenName.BLOCK_CODE_START    , "```"   , /^```/                 ),
    new TokenType(TokenName.BLOCK_CODE_END      , "```"   , /^```/                 ),
    new TokenType(TokenName.NEWLINE_MARKER      , "\n"    , /^\r?\n/               ),
    new TokenType(TokenName.TEXT                , null    , /^[^#*_>`\[\]()!\r\n]+/)   // everything that's not a special keyword in markdown

]