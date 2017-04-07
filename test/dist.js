import { h } from 'preact';
import assertCloneOf from '../test_helpers/assert-clone-of';

const router = require('../');
const { Router, Link, route } = router;

chai.use(assertCloneOf);

describe('dist', () => {
	it('should export Router, Link and route', () => {
		expect(Router).to.be.a('function');
		expect(Link).to.be.a('function');
		expect(route).to.be.a('function');
		expect(router).to.equal(Router);
	});

	describe('Router', () => {
		it('should be instantiable', () => {
			let router = new Router({});
			let children = [
				<foo path="/" />,
				<foo path="/foo" />,
				<foo path="/foo/bar" />
			];

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
	});
});
