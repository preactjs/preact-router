import { h } from 'preact';
import { toBeCloneOf } from './utils/assert-clone-of';
// import '../test_helpers/assert-clone-of';

const router = require('../dist/preact-router');
const { Router, Link, route } = router;

describe('dist', () => {
	beforeAll(() => {
		jasmine.addMatchers({ toBeCloneOf });
	});

	it('should export Router, Link and route', () => {
		expect(Router).toBeInstanceOf(Function);
		expect(Link).toBeInstanceOf(Function);
		expect(route).toBeInstanceOf(Function);
		expect(router).toBe(Router);
	});

	describe('Router', () => {
		let children = [
			<foo path="/" />,
			<foo path="/foo" />,
			<foo path="/foo/bar" />
		];

		it('should be instantiable', () => {
			let router = new Router({});
			expect(router).toBeInstanceOf(Router);
		});

		it('should filter children (manual)', () => {
			let router = new Router({});

			expect(
				router.render({ children }, { url:'/foo' })
			).toBeCloneOf(children[1], { url: '/foo' });

			expect(
				router.render({ children }, { url:'/' })
			).toBeCloneOf(children[0]);

			expect(
				router.render({ children }, { url:'/foo/bar' })
			).toBeCloneOf(children[2]);
		});
	});
});
