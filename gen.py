"""
Name: Kevin Wang
File: gen.py
------------------
Creates an HTML file that links a Markdown file with the needed libraries and scripts.
"""

import argparse
import os

def parse_args():
    parser = argparse.ArgumentParser(add_help=False)
    parser.add_argument("markdown_file")
    parser.add_argument("-h", dest="html_file", default="index.html")
    parser.add_argument("-c", dest="css_file", default="theme.css")

    return parser.parse_args()

def main():
    args = parse_args()

    # using realpath instead of abspath method resolves symlinks, which is needed on 
    # myth, as ".ir" points to ".ir.stanford.edu"
    dir_of_this_script = os.path.dirname(os.path.realpath(__file__))

    path_of_theme = os.path.join(dir_of_this_script, args.css_file)
    path_of_expo_entrypoint = os.path.join(dir_of_this_script, "expo.js")

    dir_of_html_file = os.path.dirname(os.path.realpath(args.html_file))

    relative_path_to_theming = os.path.relpath(path_of_theme, start=dir_of_html_file)
    relative_path_to_expo_entrypoint = os.path.relpath(path_of_expo_entrypoint, start=dir_of_html_file)

    with open(args.html_file, "w") as f:
        f.write(
            f"<span id='renderer' data-md='{args.markdown_file}' data-css='{relative_path_to_theming}'></span>\n"
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
            # thank you, [[ http://stackoverflow.com/questions/5137497/find-the-current-directory-and-files-directory ]] !
            f"<script type='module' src={relative_path_to_expo_entrypoint}></script>\n"
        )

if __name__ == "__main__":
    main()
