import { AbstractSyntaxTree, ASTNode, NODE_TYPES } from "./abstractSyntaxTree.js";
import { TOKEN_TYPES, Token } from "./token.js";
import { tokenize, readFile } from "./lexer.js";

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
    // and returns the token at currentIndex, as well as 
    // an incremented index
    gobble() {
        if (this.eye().type == TOKEN_TYPES.EOF) {
            return;
        }

        // note the _post_-increment!
        // we return the element of tokens at the original currentIndex,
        // and then we also increment currentIndex
        return this.tokens[this.currentIndex++];
    }

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
        let url = this.gobble();
        linkNode.contents = url;

        // finally, we're at the end token for a link url. gobble again, and 
        // this should wrap up our gobbling!
        this.gobble();
        
        return linkNode;
    }

    gobbleUpLexemesUntil(stopType) {
        let concatenatedLexeme = "";

        while (this.eye().type != stopType) {
            concatenatedLexeme += this.eye().lexeme;

            this.gobble();
        }

        return concatenatedLexeme;
    }

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

        // now, we should be at the text token for our url. save this url:
        let url = this.gobble();
        imageNode.contents = url;

        // finally, we're at the end token for an image url. gobble again, and 
        // this should wrap up our gobbling!
        this.gobble();
        
        return imageNode;
    }

    parseInlineUntil(stopSign) {
        let allInlineNodes = [];

        // continue looping until we hit the stop sign
        while (this.eye().type != stopSign && this.eye().type != TOKEN_TYPES.EOF) {
            let token = this.eye();

            if (token.type == TOKEN_TYPES.TEXT) {
                // increment our counter by 1
                this.gobble();

                // text is simplest case: we just push it into our inline nodes array
                let textNode = new ASTNode(NODE_TYPES.TEXT, token.lexeme);
                allInlineNodes.push(textNode);
            }
            else if (token.type == TOKEN_TYPES.BOLD_START) {
                // move our counter to the token after the starting bold token
                this.gobble();

                // if we encounter a starting bold token, we have to parse inline
                // again until we encounter a ending bold token
                let boldNode = new ASTNode(NODE_TYPES.BOLD);

                // recursive case!!!
                boldNode.children = this.parseInlineUntil(TOKEN_TYPES.BOLD_END);

                // now we're at the bold end token. gobble it up!
                this.gobble();

                allInlineNodes.push(boldNode);
            }
            else if (token.type == TOKEN_TYPES.ITALIC_START) {
                // move our counter to the token after the starting italic token
                this.gobble();

                let italicNode = new ASTNode(NODE_TYPES.ITALIC);

                italicNode.children = this.parseInlineUntil(TOKEN_TYPES.ITALIC_END);

                // now we're at the italic end token. gobble it up!
                this.gobble();

                allInlineNodes.push(italicNode);
            }
            else if (token.type == TOKEN_TYPES.INLINE_CODE_START) {
                // move our counter to the token after the starting inline code token
                this.gobble();

                let inlineCodeNode = new ASTNode(NODE_TYPES.INLINE_CODE);

                inlineCodeNode.children = this.parseInlineUntil(TOKEN_TYPES.INLINE_CODE_END);

                this.gobble();

                allInlineNodes.push(inlineCodeNode);
            }
            else if (token.type == TOKEN_TYPES.BLOCK_CODE_START) {
                this.gobble();

                let blockCodeNode = new ASTNode(NODE_TYPES.BLOCK_CODE);

                blockCodeNode.chidlren = this.parseInlineUntil(TOKEN_TYPES.BLOCK_CODE_END);

                this.gobble();

                allInlineNodes.push(blockCodeNode);
            }
            else if (token.type == TOKEN_TYPES.LINK_TEXT_START) {
                allInlineNodes.push(this.craftLinkNode());
            }
            else if (token.type == TOKEN_TYPES.IMAGE_MARKER) {
                allInlineNodes.push(this.craftImageNode());
            }
            else if (token.type == TOKEN_TYPES.HEADING_1_MARKER) {
                allInlineNodes.push(this.addNodeOfType(NODE_TYPES.HEADING_1));
            }
            else if (token.type == TOKEN_TYPES.HEADING_2_MARKER) {
                allInlineNodes.push(this.addNodeOfType(NODE_TYPES.HEADING_2));
            }
            else if (token.type == TOKEN_TYPES.HEADING_3_MARKER) {
                allInlineNodes.push(this.addNodeOfType(NODE_TYPES.HEADING_3));
            }
            else if (token.type == TOKEN_TYPES.HEADING_4_MARKER) {
                allInlineNodes.push(this.addNodeOfType(NODE_TYPES.HEADING_4));
            }
            else if (token.type == TOKEN_TYPES.HEADING_5_MARKER) {
                allInlineNodes.push(this.addNodeOfType(NODE_TYPES.HEADING_5));
            }
            else if (token.type == TOKEN_TYPES.HEADING_6_MARKER) {
                allInlineNodes.push(this.addNodeOfType(NODE_TYPES.HEADING_6));
            }
            else if (token.type == TOKEN_TYPES.BLOCKQUOTE_MARKER) {
                allInlineNodes.push(this.addNodeOfType(NODE_TYPES.BLOCKQUOTE));
            }
        }

        return allInlineNodes;
    }

    addNodeOfType(nodeType) {
        let node = new ASTNode(nodeType);
        this.gobble();
        node.children = this.parseInlineUntil(TOKEN_TYPES.NEWLINE_MARKER);
        // gobble up the newline symbol
        this.gobble();
        return [node];
    }

    parseBlock() {
        let token = this.eye();

        switch (token.type) {
            case TOKEN_TYPES.HEADING_1_MARKER:
                return this.addNodeOfType(NODE_TYPES.HEADING_1);
            case TOKEN_TYPES.HEADING_2_MARKER:
                return this.addNodeOfType(NODE_TYPES.HEADING_2);
            case TOKEN_TYPES.HEADING_3_MARKER:
                return this.addNodeOfType(NODE_TYPES.HEADING_3);
            case TOKEN_TYPES.HEADING_4_MARKER:
                return this.addNodeOfType(NODE_TYPES.HEADING_4);
            case TOKEN_TYPES.HEADING_5_MARKER:
                return this.addNodeOfType(NODE_TYPES.HEADING_5);
            case TOKEN_TYPES.HEADING_6_MARKER:
                return this.addNodeOfType(NODE_TYPES.HEADING_6);
            case TOKEN_TYPES.BLOCKQUOTE_MARKER: 
                return this.addNodeOfType(NODE_TYPES.BLOCKQUOTE);
            case TOKEN_TYPES.NEWLINE_MARKER:
                this.gobble();
                return [new ASTNode(NODE_TYPES.NEWLINE)];
            default:
                return this.parseInlineUntil(TOKEN_TYPES.NEWLINE_MARKER);
        }
    }

    parse() {        
        // the root of our tree! this will be what we return...
        let tree = new AbstractSyntaxTree();

        while (this.eye().type !== TOKEN_TYPES.EOF) {
            tree.root.children.push(...this.parseBlock());
        }

        // our completed syntax tree!
        return tree;
    }
}