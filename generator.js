import { readFile } from "./lexer.js";
import { ASTNode, AbstractSyntaxTree, NODE_TYPES } from "./abstractSyntaxTree.js";
import { Parser } from "./parser.js";

const HTML_TAGS = new Map([
        [NODE_TYPES.DOCUMENT, { start: `<div id="generated-code">`, end: "</div>" }],
        [NODE_TYPES.HEADING_1, { start: "<h1>", end: "</h1>" }],
        [NODE_TYPES.HEADING_2, { start: "<h2>", end: "</h2>" }],
        [NODE_TYPES.HEADING_3, { start: "<h3>", end: "</h3>" }],
        [NODE_TYPES.HEADING_4, { start: "<h4>", end: "</h4>" }],
        [NODE_TYPES.HEADING_5, { start: "<h5>", end: "</h5>" }],
        [NODE_TYPES.HEADING_6, { start: "<h6>", end: "</h6>" }],
        [NODE_TYPES.BOLD, { start: "<strong>", end: "</strong>" }],
        [NODE_TYPES.ITALIC, { start: "<em>", end: "</em>" }],
        [NODE_TYPES.BLOCKQUOTE, { start: "<blockquote>", end: "</blockquote>" }],
        [NODE_TYPES.INLINE_CODE, { start: "<code>", end: "</code>" }],
        [NODE_TYPES.LINK, { start: `<a href="">`, end: "</a>" }],
        [NODE_TYPES.IMAGE, { start: `<img href="">`, end: "</img>" }],
        [NODE_TYPES.BLOCK_CODE, { start: "<pre><code>", end: "</code></pre>" }],
        [NODE_TYPES.NEWLINE, { start: "<br>", end: ""}],
        [NODE_TYPES.TEXT, { start: "", end: "" }],
]);

export function generate(root) {
    let tags = HTML_TAGS.get(root.type);
    let result = tags.start;

    if (root.type == NODE_TYPES.TEXT) {
        result += root.contents;
    }
    if (root.type == NODE_TYPES.LINK || root.type == NODE_TYPES.IMAGE) {
        result = result.replace(`""`, `"${root.contents}"`);
    }

    // recursive call!!!
    for (let child of root.children) {
        result += generate(child);
    }

    result += tags.end;

    return result;
}