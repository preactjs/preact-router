import { Router, route } from '../src';
import { h, render } from 'preact';
import { createHashHistory } from 'history';

const sleep = ms => new Promise(r => setTimeout(r, ms));

describe('Custom History', () => {
	describe('createHashHistory', () => {
		let scratch;

		beforeEach(() => {
			scratch = document.createElement('div');
			document.body.appendChild(scratch);
		});

		afterEach(() => {
			render(null, scratch);
			document.body.removeChild(scratch);
		});

		it('should route from initial URL', async () => {
			const Home = jasmine
				.createSpy('Home', () => <div>Home</div>)
				.and.callThrough();
			const About = jasmine
				.createSpy('About', () => <div>About</div>)
				.and.callThrough();
			const Search = jasmine
				.createSpy('Search', () => <div>Search</div>)
				.and.callThrough();

			const Main = () => (
				<Router history={createHashHistory()}>
					<Home path="/" />
					<About path="/about" />
					<Search path="/search/:query" />
				</Router>
			);

			location.hash = '';
			render(<Main />, scratch);
			await sleep(1);
			expect(Home).toHaveBeenCalled();
			expect(Home.calls.first().args[0]).toEqual(
				jasmine.objectContaining({ path: '/' })
			);
			Home.calls.reset();

			location.hash = '/about';
			await sleep(1);
			expect(Home).not.toHaveBeenCalled();
			expect(About).toHaveBeenCalled();
			expect(About.calls.first().args[0]).toEqual(
				jasmine.objectContaining({ path: '/about' })
			);
			About.calls.reset();

			location.hash = '/search/foo';
			await sleep(1);
			expect(Home).not.toHaveBeenCalled();
			expect(About).not.toHaveBeenCalled();
			expect(Search).toHaveBeenCalled();
			expect(Search.calls.first().args[0]).toEqual(
				jasmine.objectContaining({
					path: '/search/:query',
					url: '/search/foo',
					query: 'foo'
				})
			);

			route('/');

			await sleep(1);
			expect(location.hash).toEqual('#/');
			expect(Home).toHaveBeenCalled();
		});
	});
});
