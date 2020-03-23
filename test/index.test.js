import { Router, Link, route } from '../src';
import { h, render } from 'preact';
import { toBeCloneOf } from './utils/assert-clone-of';

describe('preact-router', () => {
	beforeAll(() => {
		jasmine.addMatchers({ toBeCloneOf });
	});

	it('should export Router, Link and route', () => {
		expect(Router).toBeInstanceOf(Function);
		expect(Link).toBeInstanceOf(Function);
		expect(route).toBeInstanceOf(Function);
	});

	describe('Router', () => {
		let scratch;
		let router;

		beforeEach(() => {
			scratch = document.createElement('div');
			document.body.appendChild(scratch);
		});

		afterEach(() => {
			document.body.removeChild(scratch);
			router.componentWillUnmount();
		});

		it('should filter children based on URL', () => {
			let children = [
				<foo path="/" />,
				<foo path="/foo" />,
				<foo path="/foo/bar" />
			];

			render(
				(
					<Router ref={ref => (router = ref)}>
						{children}
					</Router>
				),
				scratch
			);

			expect(
				router.render({ children }, { url:'/foo' })
			).toBeCloneOf(children[1]);

			expect(
				router.render({ children }, { url:'/' })
			).toBeCloneOf(children[0]);

			expect(
				router.render({ children }, { url:'/foo/bar' })
			).toBeCloneOf(children[2]);
		});

		it('should support nested parameterized routes', () => {
			let children = [
				<foo path="/foo" />,
				<foo path="/foo/:bar" />,
				<foo path="/foo/:bar/:baz" />
			];

			render(
				(
					<Router ref={ref => (router = ref)}>
						{children}
					</Router>
				),
				scratch
			);


			expect(
				router.render({ children }, { url:'/foo' })
			).toBeCloneOf(children[0]);

			expect(
				router.render({ children }, { url:'/foo/bar' })
			).toBeCloneOf(children[1], { matches: { bar:'bar' }, url:'/foo/bar' });

			expect(
				router.render({ children }, { url:'/foo/bar/baz' })
			).toBeCloneOf(children[2], { matches: { bar:'bar', baz:'baz' }, url:'/foo/bar/baz' });
		});

		it('should support default routes', () => {
			let children = [
				<foo default />,
				<foo path="/" />,
				<foo path="/foo" />
			];

			render(
				(
					<Router ref={ref => (router = ref)}>
						{children}
					</Router>
				),
				scratch
			);

			expect(
				router.render({ children }, { url:'/foo' })
			).toBeCloneOf(children[2]);

			expect(
				router.render({ children }, { url:'/' })
			).toBeCloneOf(children[1]);

			expect(
				router.render({ children }, { url:'/asdf/asdf' })
			).toBeCloneOf(children[0], { matches: {}, url:'/asdf/asdf' });
		});

		it('should support initial route prop', () => {
			let children = [
				<foo default />,
				<foo path="/" />,
				<foo path="/foo" />
			];

			render(
				(
					<Router url="/foo"  ref={ref => (router = ref)}>
						{children}
					</Router>
				),
				scratch
			);

			expect(
				router.render({ children }, router.state)
			).toBeCloneOf(children[2]);

			render(null, scratch);

			render(
				(
					<Router ref={ref => (router = ref)}>
						{children}
					</Router>
				),
				scratch
			);

			expect(router.state.url).toBe(location.pathname + (location.search || ''));
		});

		it('should support custom history', () => {
			let push = jasmine.createSpy('push');
			let replace = jasmine.createSpy('replace');
			let listen = jasmine.createSpy('listen');
			let getCurrentLocation = jasmine.createSpy('getCurrentLocation', () => ({pathname: '/initial'})).and.callThrough();

			let children = [
				<index path="/" />,
				<foo path="/foo" />,
				<bar path="/bar" />
			];

			render(
				(
					<Router history={{ push, replace, getCurrentLocation, listen }} ref={ref => (router = ref)}>
						{children}
					</Router>
				),
				scratch
			);

			router.componentWillMount();

			router.render(router.props, router.state);
			expect(getCurrentLocation).toHaveBeenCalledTimes(1);
			expect(router.state.url).toBe('/initial');

			route('/foo');
			expect(push).toHaveBeenCalledTimes(1);
			expect(push).toHaveBeenCalledWith('/foo');

			route('/bar', true);
			expect(replace).toHaveBeenCalledTimes(1);
			expect(replace).toHaveBeenCalledWith('/bar');

			router.componentWillUnmount();
		});
	});

	describe('route()', () => {
		let router;
		let scratch;

		beforeEach(() => {
			scratch = document.createElement('div');
			document.body.appendChild(scratch);

			render(
				(
					<Router url="/foo" ref={ref => (router = ref)}>
						<foo path="/" />
						<foo path="/foo" />
					</Router>
				),
				scratch
			);

			spyOn(router, 'routeTo').and.callThrough();
		});

		afterEach(() => {
			render(null, scratch);
			document.body.removeChild(scratch);
		});

		it('should return true for existing route', () => {
			router.routeTo.calls.reset();
			expect(route('/')).toBe(true);
			expect(router.routeTo).toHaveBeenCalledTimes(1);
			expect(router.routeTo).toHaveBeenCalledWith('/');

			router.routeTo.calls.reset();
			expect(route('/foo')).toBe(true);
			expect(router.routeTo).toHaveBeenCalledTimes(1);
			expect(router.routeTo).toHaveBeenCalledWith('/foo');
		});

		it('should return false for missing route', () => {
			router.routeTo.calls.reset();
			expect(route('/asdf')).toBe(false);
			expect(router.routeTo).toHaveBeenCalledTimes(1);
			expect(router.routeTo).toHaveBeenCalledWith('/asdf');
		});

		it('should return true for fallback route', () => {
			let oldChildren = router.props.children;
			router.props.children = [
				<foo default />,
				...oldChildren
			];

			router.routeTo.calls.reset();
			expect(route('/asdf')).toBe(true);
			expect(router.routeTo).toHaveBeenCalledTimes(1);
			expect(router.routeTo).toHaveBeenCalledWith('/asdf');
		});
	});
});
