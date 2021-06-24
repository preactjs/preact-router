import { Router, Link, route } from 'preact-router';
import { Match, Link as ActiveLink } from '../match/src';
import { h, render } from 'preact';
import { act } from 'preact/test-utils';

const sleep = ms => new Promise(r => setTimeout(r, ms));

const Empty = () => null;

function fireEvent(on, type) {
	let e = document.createEvent('Event');
	e.initEvent(type, true, true);
	on.dispatchEvent(e);
}

describe('dom', () => {
	let scratch, $, mount;

	beforeAll( () => {
		scratch = document.createElement('div');
		document.body.appendChild(scratch);
		$ = s => scratch.querySelector(s);
		mount = jsx => {render(jsx, scratch); return scratch.lastChild;};
	});

	beforeEach( () => {
		// manually reset the URL before every test
		history.replaceState(null, null, '/');
		fireEvent(window, 'popstate');
	});

	afterEach( () => {
		mount(<Empty />);
		scratch.innerHTML = '';
	});

	afterAll( () => {
		document.body.removeChild(scratch);
	});

	describe('<Link />', () => {
		it('should render a normal link', () => {
			expect(
				mount(<Link href="/foo" bar="baz">hello</Link>).outerHTML
			).toEqual(
				mount(<a href="/foo" bar="baz">hello</a>).outerHTML
			);
		});

		it('should route when clicked', () => {
			let onChange = jasmine.createSpy();
			mount(
				<div>
					<Link href="/foo">foo</Link>
					<Router onChange={onChange}>
						<div default />
					</Router>
				</div>
			);
			onChange.calls.reset();
			act(() => {
				$('a').click();
			});
			expect(onChange).toHaveBeenCalled();
			expect(onChange).toHaveBeenCalledWith(jasmine.objectContaining({ url:'/foo' }));
		});
	});

	describe('<a>', () => {
		it('should route for existing routes', () => {
			let onChange = jasmine.createSpy();
			mount(
				<div>
					<a href="/foo">foo</a>
					<Router onChange={onChange}>
						<div default />
					</Router>
				</div>
			);
			onChange.calls.reset();
			act(() => {
				$('a').click();
			});
			// fireEvent($('a'), 'click');
			expect(onChange).toHaveBeenCalled();
			expect(onChange).toHaveBeenCalledWith(jasmine.objectContaining({ url:'/foo' }));
		});

		it('should not intercept non-preact elements', () => {
			let onChange = jasmine.createSpy();
			mount(
				<div>
					<div dangerouslySetInnerHTML={{ __html: `<a href="#foo">foo</a>` }} />
					<Router onChange={onChange}>
						<div default />
					</Router>
				</div>
			);
			onChange.calls.reset();
			act(() => {
				$('a').click();
			});
			expect(onChange).not.toHaveBeenCalled();
			expect(location.href).toContain('#foo');
		});
	});

	describe('Router', () => {
		it('should add and remove children', () => {
			class A {
				componentWillMount() {}
				componentWillUnmount() {}
				render(){ return <div />; }
			}
			const componentWillMount = spyOn(A.prototype, 'componentWillMount');
			const componentWillUnmount = spyOn(A.prototype, 'componentWillUnmount');
			mount(
				<Router>
					<A path="/foo" />
				</Router>
			);
			expect(componentWillMount).not.toHaveBeenCalled();
			act(() => {
				route('/foo');
			});
			expect(componentWillMount).toHaveBeenCalledTimes(1);
			expect(componentWillUnmount).not.toHaveBeenCalled();
			act(() => {
				route('/bar');
			});
			expect(componentWillMount).toHaveBeenCalledTimes(1);
			expect(componentWillUnmount).toHaveBeenCalledTimes(1);
		});

		it('should support re-routing', async () => {
			class A {
				componentWillMount() {
					route('/b');
				}
				render(){ return <div class="a" />; }
			}
			class B {
				componentWillMount(){}
				render(){ return <div class="b" />; }
			}
			const mountA = spyOn(A.prototype, 'componentWillMount');
			const mountB = spyOn(B.prototype, 'componentWillMount');
			mount(
				<Router>
					<A path="/a" />
					<B path="/b" />
				</Router>
			);
			expect(mountA).not.toHaveBeenCalled();
			act(() => {
				route('/a');
			});
			expect(mountA).toHaveBeenCalledTimes(1);
			mountA.calls.reset();
			expect(location.pathname).toEqual('/a');
			act(() => {
				route('/b');
			});

			await sleep(10);

			expect(mountA).not.toHaveBeenCalled();
			expect(mountB).toHaveBeenCalledTimes(1);
			expect(scratch.firstElementChild.className).toBe('b');
		});

		it('should not carry over the previous value of a query parameter', () => {
			class A {
				render({ bar }){ return <p>bar is {bar}</p>; }
			}
			let routerRef;
			mount(
				<Router ref={r => routerRef = r}>
					<A path="/foo" />
				</Router>
			);
			act(() => {
				route('/foo');
			});
			expect(routerRef.base.outerHTML).toEqual('<p>bar is </p>');
			act(() => {
				route('/foo?bar=5');
			});
			expect(routerRef.base.outerHTML).toEqual('<p>bar is 5</p>');
			act(() => {
				route('/foo');
			});
			expect(routerRef.base.outerHTML).toEqual('<p>bar is </p>');
		});
	});

	describe('preact-router/match', () => {
		describe('<Match>', () => {
			it('should invoke child function with match status when routing', async () => {
				let spy1 = jasmine.createSpy('spy1'),
					spy2 = jasmine.createSpy('spy2'),
					spy3 = jasmine.createSpy('spy3');

				mount(
					<div>
						<Router />
						<Match path="/foo">{spy1}</Match>
						<Match path="/bar">{spy2}</Match>
						<Match path="/bar/:param">{spy3}</Match>
					</div>
				);

				expect(spy1).withContext('spy1 /').toHaveBeenCalledWith(jasmine.objectContaining({ matches: false, path:'/', url:'/' }));
				expect(spy2).withContext('spy2 /').toHaveBeenCalledWith(jasmine.objectContaining({ matches: false, path:'/', url:'/' }));
				expect(spy3).withContext('spy3 /').toHaveBeenCalledWith(jasmine.objectContaining({ matches: false, path:'/', url:'/' }));

				spy1.calls.reset();
				spy2.calls.reset();
				spy3.calls.reset();

				act(() => {
					route('/foo');
				});

				await sleep(10);

				expect(spy1).withContext('spy1 /foo').toHaveBeenCalledWith(jasmine.objectContaining({ matches: true, path:'/foo', url:'/foo' }));
				expect(spy2).withContext('spy2 /foo').toHaveBeenCalledWith(jasmine.objectContaining({ matches: false, path:'/foo', url:'/foo' }));
				expect(spy3).withContext('spy3 /foo').toHaveBeenCalledWith(jasmine.objectContaining({ matches: false, path:'/foo', url:'/foo' }));
				spy1.calls.reset();
				spy2.calls.reset();
				spy3.calls.reset();

				act(() => {
					route('/foo?bar=5');
				});

				await sleep(10);

				expect(spy1).withContext('spy1 /foo?bar=5').toHaveBeenCalledWith(jasmine.objectContaining({ matches: true, path:'/foo', url:'/foo?bar=5' }));
				expect(spy2).withContext('spy2 /foo?bar=5').toHaveBeenCalledWith(jasmine.objectContaining({ matches: false, path:'/foo', url:'/foo?bar=5' }));
				expect(spy3).withContext('spy3 /foo?bar=5').toHaveBeenCalledWith(jasmine.objectContaining({ matches: false, path:'/foo', url:'/foo?bar=5' }));
				spy1.calls.reset();
				spy2.calls.reset();
				spy3.calls.reset();

				act(() => {
					route('/bar');
				});

				await sleep(10);

				expect(spy1).withContext('spy1 /bar').toHaveBeenCalledWith(jasmine.objectContaining({ matches: false, path:'/bar', url:'/bar' }));
				expect(spy2).withContext('spy2 /bar').toHaveBeenCalledWith(jasmine.objectContaining({ matches: true, path:'/bar', url:'/bar' }));
				expect(spy3).withContext('spy3 /bar').toHaveBeenCalledWith(jasmine.objectContaining({ matches: false, path:'/bar', url:'/bar' }));
				spy1.calls.reset();
				spy2.calls.reset();
				spy3.calls.reset();

				act(() => {
					route('/bar/123');
				});

				await sleep(10);

				expect(spy1).withContext('spy1 /bar/123').toHaveBeenCalledWith(jasmine.objectContaining({ matches: false, path:'/bar/123', url:'/bar/123' }));
				expect(spy2).withContext('spy2 /bar/123').toHaveBeenCalledWith(jasmine.objectContaining({ matches: false, path:'/bar/123', url:'/bar/123' }));
				expect(spy3).withContext('spy3 /bar/123').toHaveBeenCalledWith(jasmine.objectContaining({ matches: true, path:'/bar/123', url:'/bar/123' }));
			});
		});

		describe('<Link>', () => {
			it('should render with active class when active', async () => {
				mount(
					<div>
						<Router />
						<ActiveLink activeClassName="active" path="/foo">foo</ActiveLink>
						<ActiveLink activeClassName="active" class="bar" path="/bar">bar</ActiveLink>
					</div>
				);
				route('/foo');

				await sleep(1);

				expect(scratch.innerHTML).toEqual('<div><a class="active">foo</a><a class="bar">bar</a></div>');

				route('/foo?bar=5');

				await sleep(1);

				expect(scratch.innerHTML).toEqual('<div><a class="active">foo</a><a class="bar">bar</a></div>');

				route('/bar');

				await sleep(1);

				expect(scratch.innerHTML).toEqual('<div><a class="">foo</a><a class="bar active">bar</a></div>');
			});
		});
	});
});
