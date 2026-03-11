const autoprefixer = require('autoprefixer');
const purgecss = require('@fullhuman/postcss-purgecss');
const fs = require('fs');

function extractSafelistFromFiles(paths) {
  const classPattern = /\.(-?[_a-zA-Z]+[_a-zA-Z0-9-]*)/g;
  const classes = new Set();

  for (const filePath of paths) {
    if (!fs.existsSync(filePath)) {
      continue;
    }

    const content = fs.readFileSync(filePath, 'utf8');
    for (const match of content.matchAll(classPattern)) {
      classes.add(match[1]);
    }
  }

  return [...classes];
}

module.exports = {
  plugins: [
    autoprefixer(),
    purgecss({
      content: [
        './layouts/**/*.html',
        './content/**/*.md',
      ],
      safelist: [
        'lazyloaded',
        'table',
        'thead',
        'tbody',
        'tr',
        'th',
        'td',
        'h5',
        'alert-link',
        'container-xxl',
        'container-fluid',
        ...extractSafelistFromFiles([
          './assets/scss/components/_alerts.scss',
          './assets/scss/components/_buttons.scss',
          './assets/scss/components/_code.scss',
          './assets/scss/components/_diagrams.scss',
          './assets/scss/components/_syntax.scss',
          './assets/scss/components/_search.scss',
          './assets/scss/common/_dark.scss',
          './assets/scss/vendor/_splide.scss',
          './node_modules/bootstrap/scss/_dropdown.scss',
          './node_modules/katex/dist/katex.css',
        ]),
      ],
    }),
  ],
}
