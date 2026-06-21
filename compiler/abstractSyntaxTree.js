/* Name: Kevin Wang
 * File: abstractSyntaxTree.js
 * --------------------------------
 * Contains the definitions of the ASTNode and AbstractSyntaxTree classes,
 * as well as an "enum" for all the possible node types in a syntax tree.
 */

// NODE_TYPES is an "enum" type--enum is in quotes since
// JavaScript doesn't have enum types, lol. So, we emulate one
// by making a read-only JavaScript Object. 
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

// ASTNode represents a singular node in the tree:
// it contains both its type (aka what kind of node it is)
// as well as its contents (if it's holding anything). it also
// has a list of children nodes so that we can recuse on this node
// later on.
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

// the AbstractSyntaxTree class is a thin wrapper around ASTNode.
// by instantiating an AbstractSyntaxTree object, it will automatically create 
// the root node for you, which is a DOCUMENT-type node. This saves us some typing
// time. :-) Wahoo!
export class AbstractSyntaxTree {
    constructor() {
        this.root = new ASTNode(NODE_TYPES.DOCUMENT);
    }
}