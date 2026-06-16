class TokenTypeInfo {
    constructor(symbol, regex) {
        this.symbol = symbol;
        this.regex = regex;
    }
}

export const TOKEN_TYPES = Object.freeze({
    HEADING_1_MARKER    : new TokenTypeInfo("#"     , /^#/                   ),
    HEADING_2_MARKER    : new TokenTypeInfo("##"    , /^##/                  ),
    HEADING_3_MARKER    : new TokenTypeInfo("###"   , /^###/                 ),
    HEADING_4_MARKER    : new TokenTypeInfo("####"  , /^####/                ),
    HEADING_5_MARKER    : new TokenTypeInfo("#####" , /^#####/               ),
    HEADING_6_MARKER    : new TokenTypeInfo("######", /^######/              ),
    BOLD_START          : new TokenTypeInfo("**"    , /^\*\*/                ),  // need \* instead of * since * is a regex character
    BOLD_END            : new TokenTypeInfo("**"    , /^\*\*/                ),  // same idea here
    ITALIC_START        : new TokenTypeInfo("_"     , /^_/                   ),  // same idea here too
    ITALIC_END          : new TokenTypeInfo("_"     , /^_/                   ),
    BLOCKQUOTE_MARKER   : new TokenTypeInfo(">"     , /^>/                   ),
    INLINE_CODE_START   : new TokenTypeInfo("`"     , /^`/                   ),
    INLINE_CODE_END     : new TokenTypeInfo("`"     , /^`/                   ),
    LINK_TEXT_START     : new TokenTypeInfo("["     , /^\[/                  ),
    LINK_TEXT_END       : new TokenTypeInfo("]"     , /^\]/                  ),
    LINK_URL_START      : new TokenTypeInfo("("     , /^\(/                  ),
    LINK_URL_END        : new TokenTypeInfo(")"     , /^\)/                  ),
    IMAGE_MARKER        : new TokenTypeInfo("!"     , /^!/                   ),
    IMAGE_ALT_TEXT_START: new TokenTypeInfo("["     , /^\[/                  ),
    IMAGE_ALT_TEXT_END  : new TokenTypeInfo("]"     , /^\]/                  ),
    IMAGE_URL_START     : new TokenTypeInfo("("     , /^\(/                  ),
    IMAGE_URL_END       : new TokenTypeInfo(")"     , /^\)/                  ),
    BLOCK_CODE_START    : new TokenTypeInfo("```"   , /^```/                 ),
    BLOCK_CODE_END      : new TokenTypeInfo("```"   , /^```/                 ),
    NEWLINE_MARKER      : new TokenTypeInfo("\n"    , /^\r?\n/               ),
    TEXT                : new TokenTypeInfo(null    , /^[^#*_>`\[\]()!\r\n]+/),  // everything that's not a special keyword in markdown
});

export class Token {
    constructor(type, lexeme) {
        this.type = type;
        this.lexeme = lexeme;
    }
}