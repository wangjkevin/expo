/* Name: Kevin Wang
 * File: generator.js
 * ----------------------
 * Converts a syntax tree into a string of HTML!
 */

import { ASTNode, AbstractSyntaxTree, NODE_TYPES } from "./abstractSyntaxTree.js";
import { Parser } from "./parser.js";

// a helpful map to easily retrieve the corresponding HTML tags for a particular
// kind of node in a tree
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
    [NODE_TYPES.IMAGE, { start: `<img src="" alt="">`, end: "</img>" }],
    [NODE_TYPES.BLOCK_CODE, { start: `<pre><code class="language-cpp">`, end: "</code></pre>" }],
    [NODE_TYPES.NEWLINE, { start: "<br>", end: ""}],
    [NODE_TYPES.TEXT, { start: "", end: "" }],
]);

// generate takes in one argument, root (an ASTNode), and traverses
// the tree to generate the corresponding HTML code
export function generate(root) {
    // note: can't use bracket syntax on JavaScript Maps,
    // so this is disallowed: HTML_TAGS[root.type]
    // you have to use the get method!
    let tags = HTML_TAGS.get(root.type);
    let result = tags.start;

    // oddball edge cases:
    //   (1) for text, we sandwich the actual text between two empty strings
    if (root.type == NODE_TYPES.TEXT) {
        result += root.contents;
    }
    //   (2) for links and images, we have to do some string processings and fill 
    //       in the actual URL we want to include, along with filling in the alt text
    //       if it's an image node
    if (root.type == NODE_TYPES.LINK) {
        result = result.replace(`href=""`, `href="${root.contents}"`);
    }
    if (root.type == NODE_TYPES.IMAGE) {
        result = result.replace(`src=""`, `src="${root.contents}"`);

        // we know an image tag can only have one child, being the text node it's storing,
        // which is the alt text
        let altText = root.children.pop().contents;
        result = result.replace(`alt=""`, `alt="${altText}"`);
    }

    // recursive call - now we recurse!!!
    // note that this _also_ acts like a base case of sorts:
    // if the current node we're on doesn't have any children, this
    // loop never runs, and we terminate this function call!
    for (let child of root.children) {
        result += generate(child);
    }

    result += tags.end;

    return result;
}