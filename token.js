export class TokenTypeInfo {
    constructor(name, symbol, regex) {
        this.name = name;  // for print-friendliness
        this.symbol = symbol;
        this.regex = regex;
    }
}

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
    TEXT                : new TokenTypeInfo("TEXT"                , null          , /^(?:[^#*_>`\[\]()!\r\n]|>(?!\s))+/),  // everything that's not a special keyword in markdown
    EOF                 : new TokenTypeInfo("EOF"                 , null          , null                               )
});

export const AMBGIUOUS_TOKEN_TYPES = [
    {start: TOKEN_TYPES.BOLD_START, end: TOKEN_TYPES.BOLD_END},
    {start: TOKEN_TYPES.ITALIC_START, end: TOKEN_TYPES.ITALIC_END},
    {start: TOKEN_TYPES.INLINE_CODE_START, end: TOKEN_TYPES.INLINE_CODE_END},
    {start: TOKEN_TYPES.BLOCK_CODE_START, end: TOKEN_TYPES.BLOCK_CODE_END},
];

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

export const ALLOWED_TOKEN_TYPES_IN_CODE = [
    // the code ones are rather obvious
    // ...these are more-so here so that the lexer _doesn't_ break :P
    TOKEN_TYPES.INLINE_CODE_START,
    TOKEN_TYPES.INLINE_CODE_END,
    TOKEN_TYPES.BLOCK_CODE_START,
    TOKEN_TYPES.BLOCK_CODE_END,

    // just like in Ed, let's allow bolding and italicizing code! :D
    TOKEN_TYPES.BOLD_START,
    TOKEN_TYPES.BOLD_END,
    TOKEN_TYPES.ITALIC_START,
    TOKEN_TYPES.ITALIC_END,

    // this is so newline characters aren't blocked
    TOKEN_TYPES.NEWLINE_MARKER,
]

export class Token {
    constructor(type, lexeme) {
        this.type = type;
        this.lexeme = lexeme;
    }
}