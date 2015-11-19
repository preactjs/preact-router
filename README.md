# preact-router

[![NPM](http://img.shields.io/npm/v/preact-router.svg)](https://www.npmjs.com/package/preact-router)
[![travis-ci](https://travis-ci.org/developit/preact-router.svg)](https://travis-ci.org/developit/preact-router)

Connect your [Preact] components up to that address bar.


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


---


### License

[MIT]


[Preact]: https://github.com/developit/preact
[MIT]: http://choosealicense.com/licenses/mit/
