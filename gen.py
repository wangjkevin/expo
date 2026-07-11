"""
Name: Kevin Wang
File: gen.py
------------------
Creates an HTML file that links a Markdown file with the needed libraries and scripts.
"""

import argparse

def parse_args():
    parser = argparse.ArgumentParser(add_help=False)
    parser.add_argument("markdown_file")
    parser.add_argument("-h", dest="html_file", default="index.html")
    parser.add_argument("-c", dest="css_file", default="theme.css")

    return parser.parse_args()

def main():
    args = parse_args()

    with open(args.html_file, "w") as f:
        f.write(
            f"<span id='renderer' data-md='{args.markdown_file}' data-css='{args.css_file}'></span>\n"
            f"\n"
            f"<!-- LaTeX typesetting support! -->\n"
            f"<script id='MathJax-script' src='https://cdn.jsdelivr.net/npm/mathjax@4/tex-mml-chtml.js'></script>\n"
            f"\n"
            f"<!-- for awesome code highlighting :-) -->\n"
            f"<script src='https://cdn.jsdelivr.net/npm/prismjs@1.29.0/components/prism-core.min.js'></script>\n"
            f"<script src='https://cdn.jsdelivr.net/npm/prismjs@1.29.0/components/prism-clike.min.js'></script>\n"
            f"<script src='https://cdn.jsdelivr.net/npm/prismjs@1.29.0/components/prism-c.min.js'></script>\n"
            f"<script src='https://cdn.jsdelivr.net/npm/prismjs@1.29.0/components/prism-cpp.min.js'></script>\n"
            f"\n"
            f"<script type='module' src='expo.js'></script>\n"
        )

if __name__ == "__main__":
    main()