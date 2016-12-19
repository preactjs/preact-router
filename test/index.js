import { Router, Link, route } from 'src';
import { h } from 'preact';

describe('preact-router', () => {
	it('should export Router, Link and route', () => {
		expect(Router).to.be.a('function');
		expect(Link).to.be.a('function');
		expect(route).to.be.a('function');
	});

	describe('Router', () => {
		it('should filter children based on URL', () => {
			let router = new Router({});
			let children = [
				<foo path="/" />,
				<foo path="/foo" />,
				<foo path="/foo/bar" />
			];

			expect(
				router.render({ children }, { url:'/foo' })
			).to.equal(children[1]);

			expect(
				router.render({ children }, { url:'/' })
			).to.equal(children[0]);

			expect(
				router.render({ children }, { url:'/foo/bar' })
			).to.equal(children[2]);
		});

		it('should support nested parameterized routes', () => {
			let router = new Router({});
			let children = [
				<foo path="/foo" />,
				<foo path="/foo/:bar" />,
				<foo path="/foo/:bar/:baz" />
			];

			expect(
				router.render({ children }, { url:'/foo' })
			).to.equal(children[0]);

			expect(
				router.render({ children }, { url:'/foo/bar' })
			).to.equal(children[1]).and.have.deep.property('attributes.bar', 'bar');

			expect(
				router.render({ children }, { url:'/foo/bar/baz' })
			).equal(children[2]).and.have.deep.property('attributes')
				.which.contains.all.keys({ bar:'bar', baz:'baz' });
		});

		it('should support default routes', () => {
			let router = new Router({});
			let children = [
				<foo default />,
				<foo path="/" />,
				<foo path="/foo" />
			];

			expect(
				router.render({ children }, { url:'/foo' })
			).to.equal(children[2]);

			expect(
				router.render({ children }, { url:'/' })
			).to.equal(children[1]);

			expect(
				router.render({ children }, { url:'/asdf/asdf' })
			).to.equal(children[0]);
		});

		it('should support initial route prop', () => {
			let router = new Router({ url:'/foo' });
			let children = [
				<foo default />,
				<foo path="/" />,
				<foo path="/foo" />
			];

			expect(
				router.render({ children }, router.state)
			).to.equal(children[2]);

			expect(new Router({})).to.have.deep.property('state.url', location.pathname + (location.search || ''));
		});

		it('should support custom history', () => {
			let push = sinon.spy();
			let replace = sinon.spy();
			let getCurrentLocation = sinon.spy(() => ({pathname: '/initial'}));
			let router = new Router({
				history: { push, replace, getCurrentLocation },
				children: [
					<index path="/" />,
					<foo path="/foo" />,
					<bar path="/bar" />
				]
			});

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

		before( () => {
			router = new Router({
				url: '/foo',
				children: [
					<foo path="/" />,
					<foo path="/foo" />
				]
			}, {});

			sinon.spy(router, 'routeTo');

			router.componentWillMount();
		});

		after( () => {
			router.componentWillUnmount();
		});

		it('should return true for existing route', () => {
			router.routeTo.reset();
			expect(route('/')).to.equal(true);
			expect(router.routeTo)
				.to.have.been.calledOnce
				.and.calledWithExactly('/');

			router.routeTo.reset();
			expect(route('/foo')).to.equal(true);
			expect(router.routeTo)
				.to.have.been.calledOnce
				.and.calledWithExactly('/foo');
		});

		it('should return false for missing route', () => {
			router.routeTo.reset();
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

			router.routeTo.reset();
			expect(route('/asdf')).to.equal(true);
			expect(router.routeTo)
				.to.have.been.calledOnce
				.and.calledWithExactly('/asdf');
		});
	});
});
