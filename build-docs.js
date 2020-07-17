const fs = require('fs');
const path = require('path');
const mkdirp = require('mkdirp');
const MarkdownIt = require('markdown-it');
const hljs = require('highlight.js');

const sourceRoot = 'docs';
const outputRoot = 'public/docs';
const entryPoints = [
  'emulator-suite/_includes/_firestore_instrument',
  'emulator-suite/_includes/_firestore_admin_quickstart',
  'emulator-suite/_includes/_rtdb_instrument',
  'emulator-suite/_includes/_rtdb_admin_quickstart',
  'emulator-suite/_includes/_functions_instrument',
];

const md = new MarkdownIt({
  html: true,
  highlight: function(str, lang) {
    if (lang && hljs.getLanguage(lang)) {
      try {
        return hljs.highlight(lang, str).value;
      } catch (err) {
        console.warn(err);
      }
    }

    return ''; // use external default escaping
  },
});

entryPoints.forEach(entryPoint => {
  const inputFile = path.join(__dirname, sourceRoot, entryPoint + '.md');
  const outputFile = path.join(__dirname, outputRoot, entryPoint + '.html');

  const source = fs.readFileSync(inputFile, 'utf-8');
  let result = md.render(preProcess(source, inputFile));
  result =
    `<link
  rel="stylesheet"
  href="https://www.gstatic.com/devrel-devsite/prod/v2e3f09d6e6536badfdb5bf4153d08404c10f0bdcdc9056b4896a90327dc2c4ff/firebase/css/app.css"
/>
<link rel="stylesheet"
      href="//cdn.jsdelivr.net/gh/highlightjs/cdn-release@10.0.0/build/styles/github.min.css">
<link rel="stylesheet" href="//fonts.googleapis.com/css?family=Google+Sans:400,500|Roboto:400,400italic,500,500italic,700,700italic|Roboto+Mono:400,500,700|Material+Icons">
<style>
  body {
    height: auto;
    padding: 0 32px;
  }
  body, html {
    overflow-x: hidden;
  }
  .ds-selector-tabs {
    display: block;
  }
</style>
<body dir="ltr">
<div layout="docs" class="devsite-article-body">
` + result;
  mkdirp.sync(path.dirname(outputFile));
  fs.writeFileSync(outputFile, result, 'utf-8');
});

function preProcess(source, filePath) {
  source = source.replace(
    /^(Note): ((.|[\r\n][^\r\n])+)/g,
    (_, name, content) => {
      return `
<aside class="${name.toLowerCase()}">
  <strong>${name}:</strong>
  ${content}
</aside>
    `;
    }
  );
  return source.replace(/<<([^>]+)>>/g, (_, relPath) => {
    const includeFile = path.resolve(path.dirname(filePath), relPath);
    const includeContent = fs.readFileSync(includeFile, 'utf-8');
    return preProcess(includeContent, includeFile);
  });
}
