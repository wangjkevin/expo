import { tokenize } from "./lexer.js"

export const NODE_TYPES = Object.freeze({
    DOCUMENT: "DOCUMENT",
    HEADING_1: "HEADING_1",
    HEADING_2: "HEADING_2",
    HEADING_3: "HEADING_3",
    HEADING_4: "HEADING_4",
    HEADING_5: "HEADING_5",
    HEADING_6: "HEADING_6",
    BOLD: "BOLD",
    ITALIC: "ITALIC",
    BLOCKQUOTE: "BLOCKQUOTE",
    INLINE_CODE: "INLINE_CODE",
    LINK: "LINK",
    IMAGE: "IMAGE",
    BLOCK_CODE: "BLOCK_CODE",
    NEWLINE: "NEWLINE",
    TEXT: "TEXT",
});

export class ASTNode {
    constructor(type, contents = null) {
        // what type is this node? ex: is it a heading 1 tag? bold tag? etc.
        this.type = type;

        // what's contained inside this node, if anything?
        // primarily used for link {text, urls}, image {text, urls}, bold, italic, and regular text
        // if the type is a link or an image, the contents will be the url.
        this.contents = contents;

        // a list of ASTNode children
        this.children = [];
    }
}

export class AbstractSyntaxTree {
    constructor() {
        this.root = new ASTNode(NODE_TYPES.DOCUMENT);
    }
}