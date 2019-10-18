# preact-router

[![NPM](https://img.shields.io/npm/v/preact-router.svg)](https://www.npmjs.com/package/preact-router)
[![travis-ci](https://travis-ci.org/developit/preact-router.svg)](https://travis-ci.org/developit/preact-router)

Connect your [Preact] components up to that address bar.

`preact-router` provides a `<Router />` component that conditionally renders its children when the URL matches their `path`. It also automatically wires up `<a />` elements to the router.

> 💁 **Note:** This is not a preact-compatible version of React Router. `preact-router` is a simple URL wiring and does no orchestration for you.
>
> If you're looking for more complex solutions like nested routes and view composition, [react-router](https://github.com/ReactTraining/react-router) works great with preact as long as you alias in [preact-compat](https://github.com/developit/preact-compat).  React Router 4 even [works directly with Preact](https://codepen.io/developit/pen/BWxepY?editors=0010), no compatibility layer needed!

#### [See a Real-world Example :arrow_right:](https://jsfiddle.net/developit/qc73v9va/)


---


### Usage Example

```js
import Router from 'preact-router';
import { h, render } from 'preact';
/** @jsx h */

const Main = () => (
	<Router>
		<Home path="/" />
		<About path="/about" />
		// Advanced is an optional query
		<Search path="/search/:query/:advanced?" />
	</Router>
);

render(<Main />, document.body);
```

If there is an error rendering the destination route, a 404 will be displayed.


### Handling URLS

:information_desk_person: Pages are just regular components that get mounted when you navigate to a certain URL.
Any URL parameters get passed to the component as `props`.

Defining what component(s) to load for a given URL is easy and declarative.
You can even mix-and-match URL parameters and normal `props`.
You can also make params optional by adding a `?` to it.

```js
<Router>
  <A path="/" />
  <B path="/b" id="42" />
  <C path="/c/:id" />
  <C path="/d/:optional?/:params?" />
  <D default />
</Router>
```


### Lazy Loading

Lazy loading (code splitting) with `preact-router` can be implemented easily using the [AsyncRoute](https://www.npmjs.com/package/preact-async-route) module:

```js
import AsyncRoute from 'preact-async-route';
<Router>
  <Home path="/" />
  <AsyncRoute
    path="/friends"
    getComponent={ () => import('./friends').then(module => module.default) }
  />
  <AsyncRoute
    path="/friends/:id"
    getComponent={ () => import('./friend').then(module => module.default) }
    loading={ () => <div>loading...</div> }
  />
</Router>
```


### Active Matching & Links

`preact-router` includes an add-on module called `match` that lets you wire your components up to Router changes.

Here's a demo of `<Match>`, which invokes the function you pass it (as its only child) in response to any routing:

```js
import Router from 'preact-router';
import Match from 'preact-router/match';

render(
  <div>
    <Match path="/">
      { ({ matches, path, url }) => (
        <pre>{url}</pre>
      ) }
    </Match>
    <Router>
      <div default>demo fallback route</div>
    </Router>
  </div>
)

// another example: render only if at a given URL:

render(
  <div>
    <Match path="/">
      { ({ matches }) => matches && (
        <h1>You are Home!</h1>
      ) }
    </Match>
    <Router />
  </div>
)
```

`<Link>` is just a normal link, but it automatically adds and removes an "active" classname to itself based on whether it matches the current URL.

```js
import { Router } from 'preact-router';
import { Link } from 'preact-router/match';

render(
  <div>
    <nav>
      <Link activeClassName="active" href="/">Home</Link>
      <Link activeClassName="active" href="/foo">Foo</Link>
      <Link activeClassName="active" href="/bar">Bar</Link>
    </nav>
    <Router>
      <div default>
        this is a demo route that always matches
      </div>
    </Router>
  </div>
)
```


### Default Link Behavior

Sometimes it's necessary to bypass preact-router's link handling and let the browser perform routing on its own.

This can be accomplished by adding a `native` boolean attribute to any link:

```html
<a href="/foo" native>Foo</a>
```

### Detecting Route Changes

The `Router` notifies you when a change event occurs for a route with the `onChange` callback:

```js
import { render, Component } from 'preact';
import { Router, route } from 'preact-router';

class App extends Component {

  // some method that returns a promise
  isAuthenticated() { }

  handleRoute = async e => {
    switch (e.url) {
      case '/profile':
        const isAuthed = await this.isAuthenticated();
        if (!isAuthed) route('/', true);
        break;
    }
  };

  render() {
    return (
      <Router onChange={this.handleRoute}>
        <Home path="/" />
        <Profile path="/profile" />
      </Router>
    );
  }

}
```

### Redirects

Can easily be implemented with a custom `Redirect` component;

```js
import { Component } from 'preact';
import { route } from 'preact-router';

export default class Redirect extends Component {
  componentWillMount() {
    route(this.props.to, true);
  }

  render() {
    return null;
  }
}
```

Now to create a redirect within your application, you can add this `Redirect` component to your router;

```js
<Router>
  <Bar path="/bar" />
  <Redirect path="/foo" to="/bar" />
</Router>
```


### Custom History

It's possible to use alternative history bindings, like `/#!/hash-history`:

```js
import { h } from 'preact';
import Router from 'preact-router';
import { createHashHistory } from 'history';

const Main = () => (
    <Router history={createHashHistory()}>
        <Home path="/" />
        <About path="/about" />
        <Search path="/search/:query" />
    </Router>
);

render(<Main />, document.body);
```

### Programmatically Triggering Route

Its possible to programmatically trigger a route to a page (like `window.location = '/page-2'`)

```js
import { route } from 'preact-router';

route('/page-2')  // appends a history entry

route('/page-3', true)  // replaces the current history entry
```

### License

[MIT]


[Preact]: https://github.com/developit/preact
[MIT]: https://choosealicense.com/licenses/mit/
