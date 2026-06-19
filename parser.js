/* Name: Kevin Wang
 * File: parser.js
 * -----------------
 * Converts an array of Tokens into an AbstractSyntaxTree.
 */

import { AbstractSyntaxTree, ASTNode, NODE_TYPES } from "./abstractSyntaxTree.js";
import { TOKEN_TYPES, Token } from "./token.js";

// like PAIRED_TOKEN_TYPES in token.js, but slightly different. because
// we're past the tokenization layer, we also need to know what kind of node
// each paired token type is associated with
const PAIRED_TOKENS = new Map([
    [TOKEN_TYPES.BOLD_START, { nodeType: NODE_TYPES.BOLD, end: TOKEN_TYPES.BOLD_END }],
    [TOKEN_TYPES.ITALIC_START, { nodeType: NODE_TYPES.ITALIC, end: TOKEN_TYPES.ITALIC_END }],
    [TOKEN_TYPES.INLINE_CODE_START, { nodeType: NODE_TYPES.INLINE_CODE, end: TOKEN_TYPES.INLINE_CODE_END }],
    [TOKEN_TYPES.BLOCK_CODE_START, { nodeType: NODE_TYPES.BLOCK_CODE, end: TOKEN_TYPES.BLOCK_CODE_END }],
]);

// SOLITARY_MARKER_TOKENS maps each marker token that are not
// directly attached to any other kind of token (like an image marker token)
// to the corresponding node type
const SOLITARY_MARKER_TOKENS = new Map([
    [TOKEN_TYPES.HEADING_1_MARKER, NODE_TYPES.HEADING_1],
    [TOKEN_TYPES.HEADING_2_MARKER, NODE_TYPES.HEADING_2],
    [TOKEN_TYPES.HEADING_3_MARKER, NODE_TYPES.HEADING_3],
    [TOKEN_TYPES.HEADING_4_MARKER, NODE_TYPES.HEADING_4],
    [TOKEN_TYPES.HEADING_5_MARKER, NODE_TYPES.HEADING_5],
    [TOKEN_TYPES.HEADING_6_MARKER, NODE_TYPES.HEADING_6],
    [TOKEN_TYPES.BLOCKQUOTE_MARKER, NODE_TYPES.BLOCKQUOTE],
]);

// this Parser class provides functionality to parse
// an array of tokens and create an abstract syntax tree (AST)
// from this array. unlike the lexer (or generator), we put
// all the logic to parse under this class due to how we parse
// tokens. as we parse tokens, we keep track of where we are within
// the tokens array with the member variable currentIndex. however,
// with a functional programming approach, we would have to 
// pass this currentIndex in and out of functions, and we would always
// have to return this currentIndex parameter anytime we would update
// its value in a function. for this reason, the parsing implementation
// is abstracted through this class
export class Parser {
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
    // and returns the token at currentIndex, and then increments
    // currentIndex
    gobble() {
        if (this.eye().type == TOKEN_TYPES.EOF) {
            return;
        }

        // note the _post_-increment!
        // we return the element of tokens at the original currentIndex,
        // and then we also increment currentIndex
        return this.tokens[this.currentIndex++];
    }

    // craftLinkeNode takes in no arguments and crafts a link node
    // it gobbles up tokens in our tokens array, conjuring up the
    // properties of the node as we go
    craftLinkNode() {
        let linkNode = new ASTNode(NODE_TYPES.LINK);

        // gobble up the [
        this.gobble();

        // now we recurse!!!
        linkNode.children = this.parseInlineUntil(TOKEN_TYPES.LINK_TEXT_END);

        // now, we should be at ]
        // let's gobble it up:
        this.gobble();

        // now, we should be at the beginning of the (
        // gobble again:
        this.gobble();

        // now, we should be at the text token for our url. save this url:
        linkNode.contents = this.gobble().lexeme;

        // finally, we're at the end token for a link url. gobble again, and 
        // this should wrap up our gobbling!
        this.gobble();
        
        return linkNode;
    }

    // gobbleUpLexemesUntil takes in one argument, stopType (TokenTypeInfo),
    // and returns a single concatenated lexeme of all the lexemes from
    // where we currently are in the tokens array with currentIndex up until
    // we hit a token of type stopType
    gobbleUpLexemesUntil(stopType) {
        let concatenatedLexeme = "";

        while (this.eye().type != stopType && this.eye().type != TOKEN_TYPES.EOF) {
            concatenatedLexeme += this.eye().lexeme;

            this.gobble();
        }

        return concatenatedLexeme;
    }

    // craftImageNode takes in no arguments and crafts an image node
    // it gobbles up tokens in our tokens array, conjuring up the
    // properties of the node as we go
    craftImageNode() {
        let imageNode = new ASTNode(NODE_TYPES.IMAGE);

        // gobble up the image marker: !
        this.gobble();

        // gobble up the [
        this.gobble();

        // images are tricky since the alt text might have nested symbols.
        // to remedy this, let's gobble up the text until we find the end of the
        // alt text, ]
        imageNode.children = [new ASTNode(
            NODE_TYPES.TEXT, 
            this.gobbleUpLexemesUntil(TOKEN_TYPES.IMAGE_ALT_TEXT_END))
        ];

        // now, we gobble up the ]
        this.gobble();

        // gobble again to go past the (
        this.gobble();

        // now, we should be at the text token for our url. save this url:
        imageNode.contents = this.gobble().lexeme;

        // finally, we're at the end token for an image url. gobble again, and 
        // this should wrap up our gobbling!
        this.gobble();
        
        return imageNode;
    }

    // craftPairedNoed takes in two arguments:
    //     - nodeType
    //     - endTokenType
    // and returns the node corresponding to paired tokens
    craftPairedNode(nodeType, endTokenType) {
        // move our counter to the token after the starting token
        this.gobble();

        let node = new ASTNode(nodeType);

        // we have to parse inline again until we encounter a ending token
        node.children = this.parseInlineUntil(endTokenType);

        // now we're at the ending token. gobble it up!
        this.gobble();

        return node;
    }

    // isStartOfPairedTokens takes in one argument, token (Token),
    // and returns true if it is the start of the pair of tokens,
    // false otherwise
    isStartOfPairedTokens(token) {
        return PAIRED_TOKENS.get(token.type) != undefined;
    }

    // isSolitaryMarkerToken takes in one argument, token (Token),
    // and returns true if it is a solitary marker, false otherwise
    isSolitaryMarkerToken(token) {
        return SOLITARY_MARKER_TOKENS.get(token.type) != undefined;
    }

    // conjureNode takes in one argument, token (Token), and returns the node
    // corresponding to the input token
    conjureNode(token) {
        if (token.type == TOKEN_TYPES.TEXT) {
            // increment our counter by 1
            this.gobble();

            // text is simplest case: we just push it into our inline nodes array
            let textNode = new ASTNode(NODE_TYPES.TEXT, token.lexeme);
            return textNode;
        }
        else if (this.isStartOfPairedTokens(token)) {
            let nodeType = PAIRED_TOKENS.get(token.type).nodeType;
            let endTokenType = PAIRED_TOKENS.get(token.type).end;
            return this.craftPairedNode(nodeType, endTokenType);
        }
        else if (this.isSolitaryMarkerToken(token)) {
            return this.addNodeOfType(
                SOLITARY_MARKER_TOKENS.get(token.type)
            );
        }
        else if (token.type == TOKEN_TYPES.LINK_TEXT_START) {
            return this.craftLinkNode();
        }
        else if (token.type == TOKEN_TYPES.IMAGE_MARKER) {
            return this.craftImageNode();
        }
        else if (token.type == TOKEN_TYPES.NEWLINE_MARKER) {
            this.gobble();
            return new ASTNode(NODE_TYPES.NEWLINE);
        }

        return null;
    }

    // parseInlineUntil takes in one argument, stopSign, and continues
    // parsing (i.e. creating nodes) until the token we're on has a token
    // type of stopSign
    parseInlineUntil(stopSign) {
        let allInlineNodes = [];

        // continue looping until we hit the stop sign
        while (this.eye().type != stopSign && this.eye().type != TOKEN_TYPES.EOF) {
            let token = this.eye();

            let node = this.conjureNode(token);
            if (node != null) allInlineNodes.push(node);
        }

        return allInlineNodes;
    }

    // addNodeOfType takes in one argument, nodeType, and returns
    // a node of type nodeType
    addNodeOfType(nodeType) {
        let node = new ASTNode(nodeType);

        this.gobble();
        node.children = this.parseInlineUntil(TOKEN_TYPES.NEWLINE_MARKER);

        return node;
    }

    // parse takes in no arguments and returns the completed
    // abstract syntax tree!
    parse() {        
        // the root of our tree! this will be what we return...
        let tree = new AbstractSyntaxTree();

        while (this.eye().type !== TOKEN_TYPES.EOF) {
            console.log(this.eye());
            console.log(this.currentIndex);
            if (this.eye().type == TOKEN_TYPES.NEWLINE_MARKER) {
                this.gobble();
                tree.root.children.push(new ASTNode(NODE_TYPES.NEWLINE));
            }
            else {
                tree.root.children.push(...this.parseInlineUntil(TOKEN_TYPES.NEWLINE_MARKER));
            }
        }

        // our completed syntax tree!
        return tree;
    }
}