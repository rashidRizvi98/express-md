# express-md

Server markdown files in the beautifully clean Github look and feel using Express middleware.

## Installation

```bash
npm install express-md --save
```

## Features

* Handles Github-Flavored Markdown, using the `marked` package.
* Per-directory template support.
* In-memory caching that can easily be replaced by a custom cache module (e.g., Redis)
* Can handle requests for an entire site, or just one subdirectory of a site.
* Pass runtime variables into Markdown files

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
  url: '/',
  // ignore the following requests
  ignore: ['/users', '/products'],
  // variables to be used within markdown files
  params: {
    // variable below replaces {{{ message }}} in md files with Hello World!
    message: 'Hello World!'
  }
});

app.use(mdRouter);

// start the server
app.listen(port, function () {
  console.log(expressMd.version + ' listening on port ' + port);
});
```

### Mapping URLs to Markdown files

Place Markdown files with the extensions `.md` or `.mdown` in your docs directory. (You can override these file extensions; see below for details.) Organize the directory any way you like, with any number of subdirectories.

Each directory can have an `index.md` (or `index.mdown`) file that will be served if the user requests the directory name.

### Templates

A `template.html` file, if present in the same directory as a Markdown document, will be used to format that document. You can have multiple templates: `expressMd` will search parent directories up the directory tree to find the nearest `template.html` and use that.

This allows you to have a default template, and override with custom templates in each subdirectory.

### Template syntax

#### {{{ title }}}

In `template.html`, the text `{{{ title }}}` will be replaced by the current document’s title. The title is guessed by taking the contents of the first non-empty HTML tag from the rendered HTML. In other words, since most people usually start their Markdown documents with an &lt;h1&gt; tag, that tag’s contents become the title.

#### {{{ markdown }}}

In `template.html`, the text `{{{ markdown }}}` will be replaced by the HTML that was rendered from the Markdown document.

#### {{{ paramName }}}

Passing a `params` object as an option, allows you to inject runtime variables into both the HTML template and markdown files.

#### Template example

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

#### Directory Structure Example

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

#### Example URLs

Given the directory structure shown above, a request for `http://localhost:3000/` would return `docs/index.md` (converted to HTML, of course).

File extensions are handled automatically. In this example, the README file can be requested as `http://localhost:3000/README` or `http://localhost:3000/README.md`.

Likewise, the `api/index.md` file can be requested as `http://localhost:3000/api/`, `http://localhost:3000/api/index.md`, or even `http://localhost:3000/api/index`.

#### Example Templates

The file `docs/index.md` is served using the template file `docs/template.html`.

The file `docs/api/index.md` would be served using the template file `docs/api/template.html`.

The file `docs/api/v1.0/index.md` is in a directory that does not have a template file. In this case, `expressMd` will search up the directory tree until it finds a template. This file would be served using the template file `docs/api/template.html`.

(If `expressMd` can find no template for a document, it will be served as a bare-bones HTML file.)

## API

### expressMd(options)

Returns the `expressMd` middleware.

#### Options

##### dir

The directory where your Markdown documents are located.

example: `{ dir: __dirname + '/docs' }`

##### url

The URL from which your documents should be served.

example (`expressMd` handles the root level of the web site): `{ url: '/' }`

example (`docsever` handles URLs under `/docs`): `{ url: '/docs/' }`

##### extensions

Markdown files with these extensons will be served.

example: `{extensions: ['.markdown', '.md']}`

> Defaults to `['.md', '.mdown']`

##### passthrough

Files with these extensions will be served as-is. This allows you to place non-Markdown files, such as CSS, images, and other assets, side-by-side with your Markdown documents.

example: `{passthrough: ['.css', '.js', '.png', '.txt']}`

> Defaults to `['.css', '.png', '.jpg', '.jpeg', '.js']`

##### headers

Add additional HTTP headers to the output.

example: `{headers: {'Cache-Control': 'public,max-age=3600'}}`

##### cache

Override the caching subsystem. The default uses an in-memory cache. To disable caching, set this to `false`. (You must use `false`. “Falsy” values like `0` or `undefined` will not work.)

No other subsystems are provided, but there is an example using Redis in the `examples` subdirectory.

example: `{cache: YourCacheClass}`

##### watch

If `true`, `expressMd` will watch your documents `dir` for changes. If any files are added, removed, or changed, the cache will be flushed. This means you do not have to restart the server if you change any of your documents or templates.

This feature is experimental and **off** by default.

example: `{watch: true}`

##### ignore

Pass an array of request paths paths to, such as `ignore: ['/users', '/stock']`

> Defaults to `false`

## Error Documents

When an HTTP error occurs, `expressMd` will look for a document matching the error number, using the same logic that is used to find templates. Currently only `404` errors are supported this way.

For example, to have a custom `404` error page, create a `404.md` file. It will be converted to HTML and served using `template.html` just like any other Markdown file would be.

Like templates, you can have custom `404.md` error documents in each subdirectory and `expressMd` will use the nearest one when serving an error.

## FAQ

### Q: How do I add a Cache-Control header ?

Use the `headers` option:

```js
var middleware = expressMd({
  headers: {'Cache-Control': 'public,max-age=3600'},
  // other options…
});
```

### Q: I updated one of my Markdown documents, but `expressMd` is still showing the old version.

The old version of the document is cached, either by `expressMd` or by your web browser.

If you used a `Cache-Control` header, the document may be cached by your web browser. Hit <kbd>F5</kbd> (or <kbd>Cmd-R</kbd>, or <kbd>Ctrl-R</kbd>) a couple of times to refresh.

If you still see the old document, then it’s been cached by `expressMd`. Your options are:

* restart `expressMd`
* or, disable server-side caching by passing `false` as the `cache` option
* or, use the experimental `watch` option so that `expressMd` will automatically notice any changes

### Q: How does the cache work ?

`expressMd` aggressively caches the rendered, HTML form of your documents.

The first time a document is requested, `expressMd` has to read it from disk (along with any template) and render it to HTML. On subsequent requests for the same document, it will be served from cache, which should be extremely fast.

In addition, requests that result in a `404` error are cached, so once `expressMd` searches for a document and doesn’t find it, it won’t waste time looking for that document again.

By default, once a document is cached, `expressMd` will never re-read that document; the cached version will always be served until you reload the server.

You also have the option to disable caching by passing `false` as the `cache` option.

If you enable the experimental `watch` option, the cache is emptied every time a change is detected in your `docs` directory or any of its subdirectories. Because it may be resource-intensive, this option is turned off by default. Enabling it when you have a large set of documents or subdirectories may exhaust available file handles. If you only have a few documents or subdirectories, feel free to try it out. Contributions to improve this feature are welcome.

## Credit where credit's due

The bulk of this code was written by [@natesilva](https://github.com/natesilva) as part of the [node-docserver](https://github.com/natesilva/node-docserver) project.

## License

Licensed under [MIT License](LICENSE)
