import { Token, TOKEN_TYPES } from "../token.js";
import { tokenize, readFile } from "../lexer.js";
import { ASTNode, AbstractSyntaxTree, NODE_TYPES } from "../abstractSyntaxTree.js";
import { Parser } from "../parser.js";

/////////////////////////////// LEXER TESTS ///////////////////////////////

function runLexerTests() {
    console.log("RUNNING LEXER TESTS...");
    console.log("test 1: can handle bolded text")
    let string = "# some **bolded** text\r\n";
    let expected = [
        new Token(TOKEN_TYPES.HEADING_1_MARKER, "# "),
        new Token(TOKEN_TYPES.TEXT, "some "),
        new Token(TOKEN_TYPES.BOLD_START, "**"),
        new Token(TOKEN_TYPES.TEXT, "bolded"),
        new Token(TOKEN_TYPES.BOLD_END, "**"),
        new Token(TOKEN_TYPES.TEXT, " text"),
        new Token(TOKEN_TYPES.NEWLINE_MARKER, "\r\n"),
        new Token(TOKEN_TYPES.EOF, null),
    ];
    console.log(`\ttest passed: ${JSON.stringify(tokenize(string)) == JSON.stringify(expected)}`);

    console.log("test 2: can handle all strings that have a start and end marker")
    string = "### This is some **bolded** and _italicized_ text with some `code` and ```block code```\r\n";
    expected = [
        new Token(TOKEN_TYPES.HEADING_3_MARKER, "### "),
        new Token(TOKEN_TYPES.TEXT, "This is some "),
        new Token(TOKEN_TYPES.BOLD_START, "**"),
        new Token(TOKEN_TYPES.TEXT, "bolded"),
        new Token(TOKEN_TYPES.BOLD_END, "**"),
        new Token(TOKEN_TYPES.TEXT, " and "),
        new Token(TOKEN_TYPES.ITALIC_START, "_"),
        new Token(TOKEN_TYPES.TEXT, "italicized"),
        new Token(TOKEN_TYPES.ITALIC_END, "_"),
        new Token(TOKEN_TYPES.TEXT, " text with some "),
        new Token(TOKEN_TYPES.INLINE_CODE_START, "`"),
        new Token(TOKEN_TYPES.TEXT, "code"),
        new Token(TOKEN_TYPES.INLINE_CODE_END, "`"),
        new Token(TOKEN_TYPES.TEXT, " and "),
        new Token(TOKEN_TYPES.BLOCK_CODE_START, "```"),
        new Token(TOKEN_TYPES.TEXT, "block code"),
        new Token(TOKEN_TYPES.BLOCK_CODE_END, "```"),
        new Token(TOKEN_TYPES.NEWLINE_MARKER, "\r\n"),
        new Token(TOKEN_TYPES.EOF, null),
    ];
    console.log(`\ttest passed: ${JSON.stringify(tokenize(string)) == JSON.stringify(expected)}`);

    console.log("test 3: links and images are correctly tokenized")
    string = "[here's a link](serebii.net) and ![here's an image](test)\n";
    expected = [
        new Token(TOKEN_TYPES.LINK_TEXT_START, "["),
        new Token(TOKEN_TYPES.TEXT, "here's a link"),
        new Token(TOKEN_TYPES.LINK_TEXT_END, "]"),
        new Token(TOKEN_TYPES.LINK_URL_START, "("),
        new Token(TOKEN_TYPES.TEXT, "serebii.net"),
        new Token(TOKEN_TYPES.LINK_URL_END, ")"),
        new Token(TOKEN_TYPES.TEXT," and "),
        new Token(TOKEN_TYPES.IMAGE_MARKER, "!"),
        new Token(TOKEN_TYPES.IMAGE_ALT_TEXT_START, "["),
        new Token(TOKEN_TYPES.TEXT, "here's an image"),
        new Token(TOKEN_TYPES.IMAGE_ALT_TEXT_END, "]"),
        new Token(TOKEN_TYPES.IMAGE_URL_START, "("),
        new Token(TOKEN_TYPES.TEXT, "test"),
        new Token(TOKEN_TYPES.IMAGE_URL_END, ")"),
        new Token(TOKEN_TYPES.NEWLINE_MARKER, "\n"),
        new Token(TOKEN_TYPES.EOF, null),
    ];

    console.log(`\ttest passed: ${JSON.stringify(tokenize(string)) == JSON.stringify(expected)}`);

    console.log("test 4: bold start token left open");
    string = "## **text** _**text2_";
    expected = [
        new Token(TOKEN_TYPES.HEADING_2_MARKER, "## "),
        new Token(TOKEN_TYPES.BOLD_START, "**"),
        new Token(TOKEN_TYPES.TEXT, "text"),
        new Token(TOKEN_TYPES.BOLD_END, "**"),
        new Token(TOKEN_TYPES.TEXT, " "),
        new Token(TOKEN_TYPES.ITALIC_START, "_"),
        new Token(TOKEN_TYPES.TEXT, "**text2"),  // DEMOTED!
        new Token(TOKEN_TYPES.ITALIC_END, "_"),
        new Token(TOKEN_TYPES.EOF, null),
    ];
    console.log(`\ttest passed: ${JSON.stringify(tokenize(string)) == JSON.stringify(expected)}`);

    console.log("test 5: stress test: all the markdown syntax!");
    string = readFile("unit_tests/test_files/everything.md");
    expected = [
        new Token(TOKEN_TYPES.HEADING_1_MARKER, "# "),
        new Token(TOKEN_TYPES.TEXT, "heading 1"),
        new Token(TOKEN_TYPES.NEWLINE_MARKER, "\r\n"),
        new Token(TOKEN_TYPES.HEADING_2_MARKER, "## "),
        new Token(TOKEN_TYPES.TEXT, "heading 2"),
        new Token(TOKEN_TYPES.NEWLINE_MARKER, "\r\n"),
        new Token(TOKEN_TYPES.HEADING_3_MARKER, "### "),
        new Token(TOKEN_TYPES.TEXT, "heading 3"),
        new Token(TOKEN_TYPES.NEWLINE_MARKER, "\r\n"),
        new Token(TOKEN_TYPES.HEADING_4_MARKER, "#### "),
        new Token(TOKEN_TYPES.TEXT, "heading 4"),
        new Token(TOKEN_TYPES.NEWLINE_MARKER, "\r\n"),
        new Token(TOKEN_TYPES.HEADING_5_MARKER, "##### "),
        new Token(TOKEN_TYPES.TEXT, "heading 5"),
        new Token(TOKEN_TYPES.NEWLINE_MARKER, "\r\n"),
        new Token(TOKEN_TYPES.HEADING_6_MARKER, "###### "),
        new Token(TOKEN_TYPES.TEXT, "heading 6"),
        new Token(TOKEN_TYPES.NEWLINE_MARKER, "\r\n"),
        new Token(TOKEN_TYPES.NEWLINE_MARKER, "\r\n"),
        new Token(TOKEN_TYPES.BOLD_START, "**"),
        new Token(TOKEN_TYPES.TEXT, "bold"),
        new Token(TOKEN_TYPES.BOLD_END, "**"),
        new Token(TOKEN_TYPES.NEWLINE_MARKER, "\r\n"),
        new Token(TOKEN_TYPES.NEWLINE_MARKER, "\r\n"),
        new Token(TOKEN_TYPES.ITALIC_START, "_"),
        new Token(TOKEN_TYPES.TEXT, "italicized"),
        new Token(TOKEN_TYPES.ITALIC_END, "_"),
        new Token(TOKEN_TYPES.NEWLINE_MARKER, "\r\n"),
        new Token(TOKEN_TYPES.NEWLINE_MARKER, "\r\n"),
        new Token(TOKEN_TYPES.BLOCKQUOTE_MARKER, "> "),
        new Token(TOKEN_TYPES.TEXT, "here's a blockquote"),
        new Token(TOKEN_TYPES.NEWLINE_MARKER, "\r\n"),
        new Token(TOKEN_TYPES.NEWLINE_MARKER, "\r\n"),
        new Token(TOKEN_TYPES.INLINE_CODE_START, "`"),
        new Token(TOKEN_TYPES.TEXT, "function tokenize(string) { ... }"),  // !!!
        new Token(TOKEN_TYPES.INLINE_CODE_END, "`"),
        new Token(TOKEN_TYPES.NEWLINE_MARKER, "\r\n"),
        new Token(TOKEN_TYPES.NEWLINE_MARKER, "\r\n"),
        new Token(TOKEN_TYPES.LINK_TEXT_START, "["),
        new Token(TOKEN_TYPES.TEXT, "here's a link"),
        new Token(TOKEN_TYPES.LINK_TEXT_END, "]"),
        new Token(TOKEN_TYPES.LINK_URL_START, "("),
        new Token(TOKEN_TYPES.TEXT, "youtube.com"),
        new Token(TOKEN_TYPES.LINK_URL_END, ")"),
        new Token(TOKEN_TYPES.NEWLINE_MARKER, "\r\n"),
        new Token(TOKEN_TYPES.NEWLINE_MARKER, "\r\n"),
        new Token(TOKEN_TYPES.IMAGE_MARKER, "!"),
        new Token(TOKEN_TYPES.IMAGE_ALT_TEXT_START, "["),
        new Token(TOKEN_TYPES.TEXT, "here's an image"),
        new Token(TOKEN_TYPES.IMAGE_ALT_TEXT_END, "]"),
        new Token(TOKEN_TYPES.IMAGE_URL_START, "("),
        new Token(TOKEN_TYPES.TEXT, "https://img.pastemagazine.com/wp-content/avuploads/2022/11/15002949/f164158d408e025d130041f82e3399f6.jpg"),
        new Token(TOKEN_TYPES.IMAGE_URL_END, ")"),
        new Token(TOKEN_TYPES.NEWLINE_MARKER, "\r\n"),
        new Token(TOKEN_TYPES.NEWLINE_MARKER, "\r\n"),
        new Token(TOKEN_TYPES.BLOCK_CODE_START, "```"),
        new Token(TOKEN_TYPES.NEWLINE_MARKER, "\r\n"),
        new Token(TOKEN_TYPES.TEXT, "function tokenize(string) {"),
        new Token(TOKEN_TYPES.NEWLINE_MARKER, "\r\n"),
        new Token(TOKEN_TYPES.TEXT, "    ..."),
        new Token(TOKEN_TYPES.NEWLINE_MARKER, "\r\n"),
        new Token(TOKEN_TYPES.TEXT, "}"),
        new Token(TOKEN_TYPES.NEWLINE_MARKER, "\r\n"),
        new Token(TOKEN_TYPES.BLOCK_CODE_END, "```"),
        new Token(TOKEN_TYPES.NEWLINE_MARKER, "\r\n"),
        new Token(TOKEN_TYPES.NEWLINE_MARKER, "\r\n"),
        new Token(TOKEN_TYPES.TEXT, "and here's some text to end this file"),
        new Token(TOKEN_TYPES.EOF, null),
    ];
    console.log(`\ttest passed: ${JSON.stringify(tokenize(string)) == JSON.stringify(expected)}`);

    console.log("test 6: parentheses not a part of images or links are escaped as text tokens");
    string = readFile("unit_tests/test_files/tiny_finale.md");
    expected = [
        new Token(TOKEN_TYPES.HEADING_1_MARKER, "# "),
        new Token(TOKEN_TYPES.TEXT, "Extra Practice Problems! 🎯"),
        new Token(TOKEN_TYPES.NEWLINE_MARKER, "\r\n"),
        new Token(TOKEN_TYPES.NEWLINE_MARKER, "\r\n"),
        new Token(TOKEN_TYPES.TEXT, "Hi scholars! As we near the final, I wanted to give you all more opportunities to practice your CS106B skillz! At its heart, computer science can be described as the study of games. Hence, these problems are all game-themed! I hope you enjoy, and I hope you'll try out one of these games--perhaps now, or after the final!"),
        new Token(TOKEN_TYPES.NEWLINE_MARKER, "\r\n"),
        new Token(TOKEN_TYPES.NEWLINE_MARKER, "\r\n"),
        new Token(TOKEN_TYPES.HEADING_2_MARKER, "## "),
        new Token(TOKEN_TYPES.TEXT, "Backtracking: Solving Connections!"),
        new Token(TOKEN_TYPES.NEWLINE_MARKER, "\r\n"),
        new Token(TOKEN_TYPES.NEWLINE_MARKER, "\r\n"),
        new Token(TOKEN_TYPES.TEXT, "You’ve probably heard of it: the notorious Connections puzzle, infamously crafted by puzzle creator Wyna Liu and released daily by the New York Times. In Connections, your goal is to form four groups of four items each, where each group shares something in common. There’s always exactly one solution for each puzzle, and each group is more difficult than the previous. If you haven’t played this game before, try solving today’s puzzle! Chances are it’s not that easy. This experience of frustration will form the backbone of this problem. >:-)"),
        new Token(TOKEN_TYPES.NEWLINE_MARKER, "\r\n"),
        new Token(TOKEN_TYPES.NEWLINE_MARKER, "\r\n"),
        new Token(TOKEN_TYPES.TEXT, "Doom (1993) is one of those canonical video games that completely transfigured the video game landscape. It’s considered the first first-person shooter (FPS), and it revolutionized the development of game engines, as well as set up the form of the FPS (just like the structure of a novel) that would reverberate throughout every FPS game out there, like Valorant or CS:GO."),
        new Token(TOKEN_TYPES.NEWLINE_MARKER, "\r\n"),
        new Token(TOKEN_TYPES.NEWLINE_MARKER, "\r\n"),
        new Token(TOKEN_TYPES.TEXT, "(this is a snippet of the CS106B finale practice problems)"),
        new Token(TOKEN_TYPES.EOF, null),
    ];
    console.log(`\ttest passed: ${JSON.stringify(tokenize(string)) == JSON.stringify(expected)}`);

    console.log("test 7: all special brackets are correctly handled");
    string = readFile("unit_tests/test_files/brackets.md");
    expected = [
        new Token(TOKEN_TYPES.TEXT, "[test]"),
        new Token(TOKEN_TYPES.NEWLINE_MARKER, "\r\n"),
        new Token(TOKEN_TYPES.TEXT, "[[test]]"),
        new Token(TOKEN_TYPES.NEWLINE_MARKER, "\r\n"),
        new Token(TOKEN_TYPES.TEXT, "(test)"),
        new Token(TOKEN_TYPES.NEWLINE_MARKER, "\r\n"),
        new Token(TOKEN_TYPES.TEXT, "(test))"),
        new Token(TOKEN_TYPES.NEWLINE_MARKER, "\r\n"),
        new Token(TOKEN_TYPES.TEXT, "((test))"),
        new Token(TOKEN_TYPES.NEWLINE_MARKER, "\r\n"),
        new Token(TOKEN_TYPES.TEXT, "{test}"),
        new Token(TOKEN_TYPES.NEWLINE_MARKER, "\r\n"),
        new Token(TOKEN_TYPES.TEXT, "<test>"),
        new Token(TOKEN_TYPES.EOF, null),
    ];
    console.log(`\ttest passed: ${JSON.stringify(tokenize(string)) == JSON.stringify(expected)}`);

    console.log("test 8: display link text can be bolded");
    string = "[this is a **bolded** link](youtube.com)";
    expected = [
        new Token(TOKEN_TYPES.LINK_TEXT_START, "["),
        new Token(TOKEN_TYPES.TEXT, "this is a "),
        new Token(TOKEN_TYPES.BOLD_START, "**"),
        new Token(TOKEN_TYPES.TEXT, "bolded"),
        new Token(TOKEN_TYPES.BOLD_END, "**"),
        new Token(TOKEN_TYPES.TEXT, " link"),
        new Token(TOKEN_TYPES.LINK_TEXT_END, "]"),
        new Token(TOKEN_TYPES.LINK_URL_START, "("),
        new Token(TOKEN_TYPES.TEXT, "youtube.com"),
        new Token(TOKEN_TYPES.LINK_URL_END, ")"),
        new Token(TOKEN_TYPES.EOF, null),
    ];
    console.log(`\ttest passed: ${JSON.stringify(tokenize(string)) == JSON.stringify(expected)}`);
}

////////////////////////////// PARSER TESTS ///////////////////////////////

function runParserTests() {
    console.log("RUNNING PARSER TESTS...");

    console.log("test 1: inline symbols inside block symbol");
    let tokens = [
        new Token(TOKEN_TYPES.HEADING_1_MARKER, "# "),
        new Token(TOKEN_TYPES.TEXT, "some "),
        new Token(TOKEN_TYPES.BOLD_START, "**"),
        new Token(TOKEN_TYPES.TEXT, "bolded"),
        new Token(TOKEN_TYPES.BOLD_END, "**"),
        new Token(TOKEN_TYPES.TEXT, " text"),
        new Token(TOKEN_TYPES.EOF, null),
    ];
    let expected = new AbstractSyntaxTree();
    let headingNode = new ASTNode(NODE_TYPES.HEADING_1);
    expected.root.children.push(headingNode);

    headingNode.children.push(new ASTNode(NODE_TYPES.TEXT, "some "));

    let boldNode = new ASTNode(NODE_TYPES.BOLD);
    boldNode.children.push(new ASTNode(NODE_TYPES.TEXT, "bolded"));
    headingNode.children.push(boldNode);

    headingNode.children.push(new ASTNode(NODE_TYPES.TEXT, " text"));

    let parser = new Parser(tokens);
    console.log(`\ttest passed: ${JSON.stringify(parser.parse()) == JSON.stringify(expected)}`);

    console.log("test 2: empty markdown file results in only root node in tree");
    tokens = [
        new Token(TOKEN_TYPES.EOF, null)
    ];
    expected = new AbstractSyntaxTree();

    parser = new Parser(tokens);
    console.log(`\ttest passed: ${JSON.stringify(parser.parse()) == JSON.stringify(expected)}`);

    console.log("test 3: three layers of nesting!");
    tokens = [
        new Token(TOKEN_TYPES.INLINE_CODE_START, "`"),
        new Token(TOKEN_TYPES.BOLD_START, "**"),
        new Token(TOKEN_TYPES.ITALIC_START, "_"),
        new Token(TOKEN_TYPES.TEXT, "bolded and italicized inline code!"),
        new Token(TOKEN_TYPES.ITALIC_END, "_"),
        new Token(TOKEN_TYPES.BOLD_END, "**"),
        new Token(TOKEN_TYPES.INLINE_CODE_END, "`"),
        new Token(TOKEN_TYPES.EOF, null),
    ];
    parser = new Parser(tokens);
    expected = new AbstractSyntaxTree();
    
    let inlineCodeNode = new ASTNode(NODE_TYPES.INLINE_CODE);
    boldNode = new ASTNode(NODE_TYPES.BOLD);
    let italicNode = new ASTNode(NODE_TYPES.ITALIC);

    expected.root.children.push(inlineCodeNode);
    inlineCodeNode.children.push(boldNode);
    boldNode.children.push(italicNode);
    italicNode.children.push(new ASTNode(NODE_TYPES.TEXT, "bolded and italicized inline code!"));

    console.log(`\ttest passed: ${JSON.stringify(parser.parse()) == JSON.stringify(expected)}`);

    console.log("test 4: newline symbols are correctly handled");
    tokens = [
        new Token(TOKEN_TYPES.TEXT, "first line"),
        new Token(TOKEN_TYPES.NEWLINE_MARKER, "\r\n"),
        new Token(TOKEN_TYPES.TEXT, "second line"),
        new Token(TOKEN_TYPES.NEWLINE_MARKER, "\r\n"),
        new Token(TOKEN_TYPES.HEADING_4_MARKER, "#### "),
        new Token(TOKEN_TYPES.TEXT, "third line"),
        new Token(TOKEN_TYPES.NEWLINE_MARKER, "\r\n"),
        new Token(TOKEN_TYPES.INLINE_CODE_START, "`"),
        new Token(TOKEN_TYPES.TEXT, "fourth line"),
        new Token(TOKEN_TYPES.INLINE_CODE_END, "`"),
        new Token(TOKEN_TYPES.EOF, null),
    ];
    parser = new Parser(tokens);
    expected = new AbstractSyntaxTree();

    headingNode = new ASTNode(NODE_TYPES.HEADING_4);
    headingNode.children.push(new ASTNode(NODE_TYPES.TEXT, "third line"));

    inlineCodeNode = new ASTNode(NODE_TYPES.INLINE_CODE);
    inlineCodeNode.children.push(new ASTNode(NODE_TYPES.TEXT, "fourth line"));

    expected.root.children.push(
        ...[
            new ASTNode(NODE_TYPES.TEXT, "first line"),
            new ASTNode(NODE_TYPES.NEWLINE),
            new ASTNode(NODE_TYPES.TEXT, "second line"),
            new ASTNode(NODE_TYPES.NEWLINE),
            headingNode,
            new ASTNode(NODE_TYPES.NEWLINE),
            inlineCodeNode,            
        ]
    );

    console.log(`\ttest passed: ${JSON.stringify(parser.parse()) == JSON.stringify(expected)}`);

    console.log("test 5: links are correctly handled");
    tokens = [
        new Token(TOKEN_TYPES.LINK_TEXT_START, "["),
        new Token(TOKEN_TYPES.TEXT, "here's a link"),
        new Token(TOKEN_TYPES.LINK_TEXT_END, "]"),
        new Token(TOKEN_TYPES.LINK_URL_START, "("),
        new Token(TOKEN_TYPES.TEXT, "serebii.net"),
        new Token(TOKEN_TYPES.LINK_URL_END, ")"),
        new Token(TOKEN_TYPES.EOF, null),
    ];
    parser = new Parser(tokens);
    expected = new AbstractSyntaxTree();

    let linkNode = new ASTNode(NODE_TYPES.LINK, "serebii.net");
    linkNode.children.push(new ASTNode(NODE_TYPES.TEXT, "here's a link"));
    expected.root.children.push(linkNode);

    console.log(`\ttest passed: ${JSON.stringify(parser.parse()) == JSON.stringify(expected)}`);

    console.log("test 6: images are correctly handled");
    tokens = [
        new Token(TOKEN_TYPES.IMAGE_MARKER, "!"),
        new Token(TOKEN_TYPES.IMAGE_ALT_TEXT_START, "["),
        new Token(TOKEN_TYPES.TEXT, "here's an image"),
        new Token(TOKEN_TYPES.IMAGE_ALT_TEXT_END, "]"),
        new Token(TOKEN_TYPES.IMAGE_URL_START, "("),
        new Token(TOKEN_TYPES.TEXT, "test"),
        new Token(TOKEN_TYPES.IMAGE_URL_END, ")"),
        new Token(TOKEN_TYPES.NEWLINE_MARKER, "\n"),
        new Token(TOKEN_TYPES.EOF, null),
    ];
    parser = new Parser(tokens);
    expected = new AbstractSyntaxTree();

    let imageNode = new ASTNode(NODE_TYPES.IMAGE, "test");
    imageNode.children.push(new ASTNode(NODE_TYPES.TEXT, "here's an image"));
    expected.root.children.push(imageNode);
    expected.root.children.push(new ASTNode(NODE_TYPES.NEWLINE));
    
    console.log(`\ttest passed: ${JSON.stringify(parser.parse()) == JSON.stringify(expected)}`);
}

//////////////////////////// GENERATOR TESTS //////////////////////////////

function runGeneratorTests() {

}

function main() {
    runLexerTests();
    runParserTests();
    runGeneratorTests();
}

main();