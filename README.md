# preact-router

[![NPM](http://img.shields.io/npm/v/preact-router.svg)](https://www.npmjs.com/package/preact-router)
[![travis-ci](https://travis-ci.org/developit/preact-router.svg)](https://travis-ci.org/developit/preact-router)

Connect your [Preact] components up to that address bar.

`preact-router` provides a `<Router />` component that conditionally renders its children when the URL matches their `path`. It also automatically wires up `<a />` elements up to the router.

#### [See a Real-world Example :arrow_right:](http://jsfiddle.net/developit/qc73v9va/)

---


### Usage Example

```js
import Router from 'preact-router';
import { h } from 'preact';
/** @jsx h */

const Main = () => (
	<Router>
		<Home path="/" />
		<About path="/about" />
		<Search path="/search/:query" />
	</Router>
);

render(<Main />, document.body);
```


### Handling URLS

:information_desk_person: Pages are just regular components that get mounted when you navigate to a certain URL.
Any URL parameters get passed to the component as `props`.

Defining what component(s) to load for a given URL is easy and declarative.
You can even mix-and-match URL parameters and normal `props`.

```js
<Router>
  <A path="/" />
  <B path="/b" id="42" />
  <C path="/c/:id" />
  <D default />
</Router>
```



---


### License

[MIT]


[Preact]: https://github.com/developit/preact
[MIT]: http://choosealicense.com/licenses/mit/
