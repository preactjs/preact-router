import { exec, getMatchingRoutes, pathRankSort, rank, segmentize, strip } from 'src/util';

describe('util', () => {
	describe('strip', () => {
		it('should strip preceeding slashes', () => {
			expect(strip('')).to.equal('');
			expect(strip('/')).to.equal('');
			expect(strip('/a')).to.equal('a');
			expect(strip('//a')).to.equal('a');
			expect(strip('//a/')).to.equal('a');
		});

		it('should strip trailing slashes', () => {
			expect(strip('')).to.equal('');
			expect(strip('/')).to.equal('');
			expect(strip('a/')).to.equal('a');
			expect(strip('/a//')).to.equal('a');
		});
	});

	describe('rank', () => {
		it('should return number of path segments', () => {
			expect(rank('')).to.equal(0);
			expect(rank('/')).to.equal(0);
			expect(rank('//')).to.equal(0);
			expect(rank('a/b/c')).to.equal(2);
			expect(rank('/a/b/c/')).to.equal(2);
		});
	});

	describe('segmentize', () => {
		it('should split path on slashes', () => {
			expect(segmentize('')).to.eql(['']);
			expect(segmentize('/')).to.eql(['']);
			expect(segmentize('//')).to.eql(['']);
			expect(segmentize('a/b/c')).to.eql(['a','b','c']);
			expect(segmentize('/a/b/c/')).to.eql(['a','b','c']);
		});
	});

	describe('pathRankSort', () => {
		it('should sort by segment count', () => {
			let paths = arr => arr.map( path => ({attributes:{path}}) );

			expect(
				paths(['/a/b/','/a/b','/','b']).sort(pathRankSort)
			).to.eql(
				paths(['/','b','/a/b','/a/b/'])
			);
		});

		it('should return default routes last', () => {
			let paths = arr => arr.map( path => ({attributes:{path}}) );

			let defaultPath = {attributes:{default:true}};
			let p = paths(['/a/b/','/a/b','/','b']);
			p.splice(2,0,defaultPath);

			expect(
				p.sort(pathRankSort)
			).to.eql(
				paths(['/','b','/a/b','/a/b/']).concat(defaultPath)
			);
		});
	});

	describe('exec', () => {
		it('should match explicit equality', () => {
			expect(exec('/','/')).to.eql({});
			expect(exec('/a','/a')).to.eql({});
			expect(exec('/a','/b')).to.eql(false);
			expect(exec('/a/b','/a/b')).to.eql({});
			expect(exec('/a/b','/a/a')).to.eql(false);
			expect(exec('/a/b','/b/b')).to.eql(false);
		});

		it('should match param segments', () => {
			expect(exec('/', '/:foo')).to.eql(false);
			expect(exec('/bar', '/:foo')).to.eql({ foo:'bar' });
		});

		it('should match optional param segments', () => {
			expect(exec('/', '/:foo?')).to.eql({ foo:'' });
			expect(exec('/bar', '/:foo?')).to.eql({ foo:'bar' });
			expect(exec('/', '/:foo?/:bar?')).to.eql({ foo:'', bar:'' });
			expect(exec('/bar', '/:foo?/:bar?')).to.eql({ foo:'bar', bar:'' });
			expect(exec('/bar', '/:foo?/bar')).to.eql(false);
			expect(exec('/foo/bar', '/:foo?/bar')).to.eql({ foo:'foo' });
		});

		it('should match splat param segments', () => {
			expect(exec('/', '/:foo*')).to.eql({ foo:'' });
			expect(exec('/a', '/:foo*')).to.eql({ foo:'a' });
			expect(exec('/a/b', '/:foo*')).to.eql({ foo:'a/b' });
			expect(exec('/a/b/c', '/:foo*')).to.eql({ foo:'a/b/c' });
		});

		it('should match required splat param segments', () => {
			expect(exec('/', '/:foo+')).to.eql(false);
			expect(exec('/a', '/:foo+')).to.eql({ foo:'a' });
			expect(exec('/a/b', '/:foo+')).to.eql({ foo:'a/b' });
			expect(exec('/a/b/c', '/:foo+')).to.eql({ foo:'a/b/c' });
		});
	});

	describe('getMatchingRoutes', () => {
		const routeFactory =
			(path, isDefault = false) => ({
				attributes: {
					path,
					default: isDefault
				}
			});

		it('should return default route when given url does not match any route', () => {
			const defaultRoute = routeFactory('/base', true);
			const routes = [
				routeFactory('/foo'),
				defaultRoute,
				routeFactory('/bar'),
				routeFactory('/baz')
			];
			expect(getMatchingRoutes(routes, '/quux')).to.eql([{ route:defaultRoute, matches:{} }]);
		});

		it('should return empty array when given url does not match any route (and no default route is defined)', () => {
			const routes = [
				routeFactory('/foo'),
				routeFactory('/bar'),
				routeFactory('/baz')
			];
			expect(getMatchingRoutes(routes, '/quux')).to.eql([]);
		});

		it('should return list of matching routes', () => {
			const match1 = routeFactory('/bar/:bar');
			const match2 = routeFactory('/bar/lol');
			const routes = [
				routeFactory('/foo'),
				match1,
				match2,
				routeFactory('/baz')
			];
			expect(getMatchingRoutes(routes, '/bar/lol')).to.eql([{
				route: match2,
				matches: {}
			}, {
				route: match1,
				matches: { bar:'lol' }
			}]);
		});
	});
});
