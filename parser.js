import { AbstractSyntaxTree, ASTNode } from "./abstractSyntaxTree.js";

function parse(tokens) {

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