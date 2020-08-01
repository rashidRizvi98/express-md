# express-md

[![Build Status](https://travis-ci.org/orca-scan/express-md.svg?branch=master)](https://travis-ci.org/orca-scan/express-md) [![npm](https://img.shields.io/npm/dt/express-md.svg)](https://www.npmjs.com/package/express-md)

Express middleware that serves markdown (`.md` or `.mdown`) files as HTML.

## Features

* Handles Github-Flavored Markdown
* Per-directory template support
* In-memory caching
* Handle requests for an entire site, or just a subdirectory
* Variables can be passed in use [font-matter](https://jekyllrb.com/docs/front-matter/) or server side `vars` option
* Defaults to beautifully clean Github look & feel if no template provided

## Installation

```bash
npm install express-md --save
```

## Usage

``` js
var express = require('express');
var expressMd = require('express-md');
var port = 3000;

var app = express();

// create an instance of express-md with custom options
var mdRouter = expressMd({

  // serve markdown files from `docs` directory
  dir: __dirname + '/docs',

  // serve requests from root of the site
  url: '/docs',

  // variables to replace {{{ varName }}} in markdown files
  vars: {
    message: 'Hello World!'
  }
});

app.use(mdRouter);

// start the server
app.listen(port, function () {
  console.log(expressMd.version + ' listening on port ' + port);
});
```

## express-md options

You can configure express-md use the following options:

Option        | Description                                                             | Default
:-------------|:------------------------------------------------------------------------|:-----------------------------
`dir`         | Directory where markdown files are located                              |
`url`         | URL from which markdown files should be served                          |
`extensions`  | Markdown files with these extensions will be served                     | `['.md', '.mdown']`
`passthrough` | Files with these extensions will be served as-is                        | `['.css', '.png', '.jpg', '.jpeg', '.js']`
`headers`     | Add additional HTTP headers                                             |
`cache`       | Override the caching subsystem. To disable caching, set this to `false` | *in-memory cache*
`watch`       | Automatically reload files changes in `dir`                             | `false`
`ignore`      | Request paths to ignore *(supports strings and RegExp)*                 |
`vars`        | Variables to replace `{{{ variableName }}}` in markdown files           |

### Mapping URLs to Markdown files

Place Markdown files with the extensions `.md` or `.mdown` in your docs directory. (You can override these file extensions; see below for details.) Organize the directory any way you like, with any number of subdirectories.

Each directory can have an `index.md` (or `index.mdown`) file that will be served if the user requests the directory name.

### Templates

A `template.html` file, if present in the same directory as a Markdown document, will be used to format that document. You can have multiple templates: `express-md` will search parent directories up the directory tree to find the nearest `template.html` and use that.

This allows you to have a default template, and override with custom templates in each subdirectory.

### Template syntax

#### {{{ markdown }}}

In `template.html`, the text `{{{ markdown }}}` will be replaced by the HTML that was rendered from the Markdown document.

#### {{{ variableName }}}

You can specify placeholders in your HTML template using `{{{ variableName }}}` variables can be passed in using the `vars` option above, or using YAML [font-matter](https://jekyllrb.com/docs/front-matter/) within markdown files.

```yaml
---
layout: post
title: Blogging Like a Hacker
---
```

##### Example

Here is a quick example of how `express-md` resolves templates.

###### Template

```html
<html>
  <head>
    <meta charset="utf-8">
    <title>{{{ title }}}</title>
  </head>
  <body>
    {{{ markdown }}}
    {{{ message }}}
  </body>
</html>
```

###### Directory structure

For this example, assume the following directory structure:

```
docs/
├── index.md
├── README.md
├── template.html
└── api/
    ├── index.md
    ├── template.html
    └── v1.0/
        └── index.md
```

The file `docs/index.md` is served using the template file `docs/template.html`.

The file `docs/api/index.md` would be served using the template file `docs/api/template.html`.

The file `docs/api/v1.0/index.md` is in a directory that does not have a template file. In this case, `express-md` will search up the directory tree until it finds a template. This file would be served using the template file `docs/api/template.html`. If `express-md` is unable to find a template, it will be served as a bare-bones HTML file which is styled to match Github readme.

###### URLs

Given the directory structure shown above, a request for `http://localhost:3000/` would return `docs/index.md` (converted to HTML, of course).

File extensions are handled automatically. In this example, the README file can be requested as `http://localhost:3000/README` or `http://localhost:3000/README.md`.

Likewise, the `api/index.md` file can be requested as `http://localhost:3000/api/`, `http://localhost:3000/api/index.md`, or even `http://localhost:3000/api/index`.

## Error Documents

When an HTTP error occurs, `express-md` will look for a document matching the error number, using the same logic that is used to find templates. Currently only `404` errors are supported this way.

For example, to have a custom `404` error page, create a `404.md` file. It will be converted to HTML and served using `template.html` just like any other Markdown file would be.

Like templates, you can have custom `404.md` error documents in each subdirectory and `express-md` will use the nearest one when serving an error.

## FAQ

### Q: How do I add a Cache-Control header ?

Use the `headers` option:

```js
var middleware = expressMd({
  headers: {'Cache-Control': 'public,max-age=3600'},
  // other options…
});
```

### Q: I've updated one of my markdown docs, but is still showing the old version

The old version of the document is cached, either by `express-md` or by your web browser. If you used a `Cache-Control` header, the document may be cached by your web browser. Hit <kbd>F5</kbd> (or <kbd>Cmd-R</kbd>, or <kbd>Ctrl-R</kbd>) a couple of times to refresh.

If you still see the old document, then it’s been cached by `express-md`. Your options are:

* restart `express-md`
* disable server-side caching by passing `false` as the `cache` option
* use the `watch` to force `express-md` to automatically notice any changes

### Q: How does the cache work?

`express-md` aggressively caches the rendered, HTML form of your documents. The first time a document is requested, `express-md` has to read it from disk (along with any template) and render it to HTML. On subsequent requests for the same document, it will be served from cache, which should be extremely fast. In addition, requests that result in a `404` error are cached, so once `express-md` searches for a document and doesn’t find it, it won’t waste time looking for that document again.

By default, once a document is cached, `express-md` will never re-read that document; the cached version will always be served until you reload the server. You have the option to disable caching by passing `false` as the `cache` option.

If you enable the experimental `watch` option, the cache is emptied every time a change is detected in your `docs` directory or any of its subdirectories. Because it may be resource-intensive, this option is turned off by default. Enabling it when you have a large set of documents or subdirectories may exhaust available file handles. If you only have a few documents or subdirectories, feel free to try it out. Contributions to improve this feature are welcome.

## Credit where it's due

This a refactor of the [node-docserver](https://github.com/natesilva/node-docserver) project.

## License

Licensed under [MIT License](LICENSE)
