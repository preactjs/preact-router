import { Router, Link, route } from 'src';
import { h, render } from 'preact';
import assertCloneOf from '../test_helpers/assert-clone-of';

chai.use(assertCloneOf);

describe('preact-router', () => {
	it('should export Router, Link and route', () => {
		expect(Router).to.be.a('function');
		expect(Link).to.be.a('function');
		expect(route).to.be.a('function');
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
			).to.be.cloneOf(children[1]);

			expect(
				router.render({ children }, { url:'/' })
			).to.be.cloneOf(children[0]);

			expect(
				router.render({ children }, { url:'/foo/bar' })
			).to.be.cloneOf(children[2]);
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
			).to.be.cloneOf(children[0]);

			expect(
				router.render({ children }, { url:'/foo/bar' })
			).to.be.cloneOf(children[1], { matches: { bar:'bar' }, url:'/foo/bar' });

			expect(
				router.render({ children }, { url:'/foo/bar/baz' })
			).be.cloneOf(children[2], { matches: { bar:'bar', baz:'baz' }, url:'/foo/bar/baz' });
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
			).to.be.cloneOf(children[2]);

			expect(
				router.render({ children }, { url:'/' })
			).to.be.cloneOf(children[1]);

			expect(
				router.render({ children }, { url:'/asdf/asdf' })
			).to.be.cloneOf(children[0], { matches: {}, url:'/asdf/asdf' });
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
			).to.be.cloneOf(children[2]);

			render(null, scratch);

			render(
				(
					<Router ref={ref => (router = ref)}>
						{children}
					</Router>
				),
				scratch
			);

			expect(router).to.have.deep.property('state.url', location.pathname + (location.search || ''));
		});

		it('should support custom history', () => {
			let push = sinon.spy();
			let replace = sinon.spy();
			let listen = sinon.spy();
			let getCurrentLocation = sinon.spy(() => ({pathname: '/initial'}));

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
			expect(getCurrentLocation, 'getCurrentLocation').to.have.been.calledOnce;
			expect(router).to.have.deep.property('state.url', '/initial');

			route('/foo');
			expect(push, 'push').to.have.been.calledOnce.and.calledWith('/foo');

			route('/bar', true);
			expect(replace, 'replace').to.have.been.calledOnce.and.calledWith('/bar');

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

			sinon.spy(router, 'routeTo');
		});

		afterEach(() => {
			router.componentWillUnmount();
			document.body.removeChild(scratch);
		});

		it('should return true for existing route', () => {
			router.routeTo.resetHistory();
			expect(route('/')).to.equal(true);
			expect(router.routeTo)
				.to.have.been.calledOnce
				.and.calledWithExactly('/');

			router.routeTo.resetHistory();
			expect(route('/foo')).to.equal(true);
			expect(router.routeTo)
				.to.have.been.calledOnce
				.and.calledWithExactly('/foo');
		});

		it('should return false for missing route', () => {
			router.routeTo.resetHistory();
			expect(route('/asdf')).to.equal(false);
			expect(router.routeTo)
				.to.have.been.calledOnce
				.and.calledWithExactly('/asdf');
		});

		it('should return true for fallback route', () => {
			let oldChildren = router.props.children;
			router.props.children = [
				<foo default />,
				...oldChildren
			];

			router.routeTo.resetHistory();
			expect(route('/asdf')).to.equal(true);
			expect(router.routeTo)
				.to.have.been.calledOnce
				.and.calledWithExactly('/asdf');
		});
	});
});
