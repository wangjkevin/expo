import { AbstractSyntaxTree, ASTNode } from "./abstractSyntaxTree.js";

class Parser {
    constructor(tokens) {
        // our array of tokens!
        this.tokens = tokens;

        // a "pointer" into where we currently are in our tokens array.
        // we _could_ recurse by doing tokens.slice(1) every recursive call,
        // but then we would (if N is the size of the tokens array) do 
        // N + (N - 1) + (N - 2) + ... + 3 + 2 + 1  = O(N^2) total copies, which 
        // isn't so great for superrrr large markdown files. so, instead, we have a
        // "pointer" to the current element we're on. neat!
        // this style of looking at the current token is used in most production-grade
        // parsers.
        this.currentIndex = 0;
    }

    // eye takes in no arguments, and returns the token at currentIndex
    // this function is mainly here to avoid super long typing :-)
    eye() {
        return this.tokens[this.currentIndex];
    }

    // gobble takes in no arguments,
    // and returns the token at currentIndex, as well as 
    // an incremented index
    gobble() {
        // note the _post_-increment!
        // we return the element of tokens at the original currentIndex,
        // and then we also increment currentIndex
        return this.tokens[this.currentIndex++];
    }

    addHeadingNode(nodeType) {
        let headingNode = new ASTNode(nodeType);
        this.gobble();
        headingNode.children = parseInline(TOKEN_TYPES.NEWLINE_MARKER);
        return headingNode;
    }

    parseBlock() {
        let token = eye();

        switch (token.type) {
            case TOKEN_TYPES.HEADING_1_MARKER:
                return this.addHeadingNode(NODE_TYPES.HEADING_1);
            case TOKEN_TYPES.HEADING_2_MARKER:
                return this.addHeadingNode(NODE_TYPES.HEADING_2);
            case TOKEN_TYPES.HEADING_3_MARKER:
                return this.addHeadingNode(NODE_TYPES.HEADING_3);
            case TOKEN_TYPES.HEADING_4_MARKER:
                return this.addHeadingNode(NODE_TYPES.HEADING_4);
            case TOKEN_TYPES.HEADING_5_MARKER:
                return this.addHeadingNode(NODE_TYPES.HEADING_5);
            case TOKEN_TYPES.HEADING_6_MARKER:
                return this.addHeadingNode(NODE_TYPES.HEADING_6);

            case TOKEN_TYPES.BLOCKQUOTE: {

            }
        }
    }

    parse() {        
        // the root of our tree! this will be what we return...
        let root = new ASTNode(NODE_TYPES.DOCUMENT);

        while (this.eye().type !== TOKEN_TYPES.EOF) {
            root.children.push(this.parseBlock());
        }

        // our completed syntax tree!
        return root;
    }
}

function main() {

    // test 1
    let tokens = [
        new Token(TOKEN_TYPES.HEADING_1_MARKER, "#"),
        new Token(TOKEN_TYPES.TEXT, " some "),
        new Token(TOKEN_TYPES.BOLD_START, "**"),
        new Token(TOKEN_TYPES.TEXT, "bolded"),
        new Token(TOKEN_TYPES.BOLD_END, "**"),
        new Token(TOKEN_TYPES.TEXT, " text"),
    ];
    let root = new ASTNode(NODE_TYPES.DOCUMENT);
    let heading = new ASTNode(NODE_TYPES.)
}