# expo 🖍️

`expo` is a Markdown compiler that compiles Markdown into HTML. More specifically, `expo` is primarily intended to be a pedagogical tool that allows educators and other pedagogical stakeholders to create (and style) handouts with ease. Say farewell to wrangling with HTML! :-)

## ⚙️ Requirements

You'll need Node.js v24.16.0 (but any other relatively recent version as of writing this _should_ work), as well as Python 3 (any version should work). You can install Node on your machine [here](https://nodejs.org/en/download), and you can install Python 3 [here](https://www.python.org/downloads/).

## 📟 Compilation

To generate a HTML file from a Markdown file, run the following command:

```
node expo.js <markdown-file>
```

Alternatively, you can pre-generate a HTML file that's able to seamlessly "link" up to a Markdown file. This means that if you update the Markdown file, the associated HTML file will also be automatically updated to reflect the changes made in the Markdown file.

To do so, run the following command:

```
python3 gen.py <markdown-file> [-h html-file] [-c css-file]
```

You're required to pass in the path to a Markdown file, and the arguments for the HTML and CSS files are optional. If no HTML file is given, it will default to `index.html`, and if no CSS file is given, it will default to the preset styles in `theme.css`.