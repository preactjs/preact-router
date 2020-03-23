import { exec, pathRankSort, prepareVNodeForRanking, segmentize, rank } from '../src/util';

const strip = str => segmentize(str).join('/');

describe('util', () => {
	describe('strip', () => {
		it('should strip preceeding slashes', () => {
			expect(strip('')).toBe('');
			expect(strip('/')).toBe('');
			expect(strip('/a')).toBe('a');
			expect(strip('//a')).toBe('a');
			expect(strip('//a/')).toBe('a');
		});

		it('should strip trailing slashes', () => {
			expect(strip('')).toBe('');
			expect(strip('/')).toBe('');
			expect(strip('a/')).toBe('a');
			expect(strip('/a//')).toBe('a');
		});
	});

	describe('rank', () => {
		it('should return rank of path segments', () => {
			expect(rank('')).toBe('5');
			expect(rank('/')).toBe('5');
			expect(rank('//')).toBe('5');
			expect(rank('a/b/c')).toBe('555');
			expect(rank('/a/b/c/')).toBe('555');
			expect(rank('/:a/b?/:c?/:d*/:e+')).toEqual('45312');
		});
	});

	describe('segmentize', () => {
		it('should split path on slashes', () => {
			expect(segmentize('')).toEqual(['']);
			expect(segmentize('/')).toEqual(['']);
			expect(segmentize('//')).toEqual(['']);
			expect(segmentize('a/b/c')).toEqual(['a','b','c']);
			expect(segmentize('/a/b/c/')).toEqual(['a','b','c']);
		});
	});

	describe('pathRankSort', () => {
		it('should sort by highest rank first', () => {
			let paths = arr => arr.map( path => ({ props:{path}} ) );
			let clean = vnode => { delete vnode.rank; delete vnode.index; return vnode; };

			expect(
				paths(['/:a*', '/a', '/:a+', '/:a?', '/a/:b*']).filter(prepareVNodeForRanking).sort(pathRankSort).map(clean)
			).toEqual(
				paths(['/a/:b*', '/a', '/:a?', '/:a+', '/:a*'])
			);
		});

		it('should return default routes last', () => {
			let paths = arr => arr.map( path => ({props:{path}}) );
			let clean = vnode => { delete vnode.rank; delete vnode.index; return vnode; };

			let defaultPath = {props:{default:true}};
			let p = paths(['/a/b/', '/a/b', '/', 'b']);
			p.splice(2,0,defaultPath);

			expect(
				p.filter(prepareVNodeForRanking).sort(pathRankSort).map(clean)
			).toEqual(
				paths(['/a/b/', '/a/b', '/', 'b']).concat(defaultPath)
			);
		});
	});

	describe('exec', () => {
		it('should match explicit equality', () => {
			expect(exec('/','/', {})).toEqual({});
			expect(exec('/a', '/a', {})).toEqual({});
			expect(exec('/a', '/b', {})).toEqual(false);
			expect(exec('/a/b', '/a/b', {})).toEqual({});
			expect(exec('/a/b', '/a/a', {})).toEqual(false);
			expect(exec('/a/b', '/b/b', {})).toEqual(false);
		});

		it('should match param segments', () => {
			expect(exec('/', '/:foo', {})).toEqual(false);
			expect(exec('/bar', '/:foo', {})).toEqual({ foo:'bar' });
		});

		it('should match optional param segments', () => {
			expect(exec('/', '/:foo?', {})).toEqual({ foo:'' });
			expect(exec('/bar', '/:foo?', {})).toEqual({ foo:'bar' });
			expect(exec('/', '/:foo?/:bar?', {})).toEqual({ foo:'', bar:'' });
			expect(exec('/bar', '/:foo?/:bar?', {})).toEqual({ foo:'bar', bar:'' });
			expect(exec('/bar', '/:foo?/bar', {})).toEqual(false);
			expect(exec('/foo/bar', '/:foo?/bar', {})).toEqual({ foo:'foo' });
		});

		it('should match splat param segments', () => {
			expect(exec('/', '/:foo*', {})).toEqual({ foo:'' });
			expect(exec('/a', '/:foo*', {})).toEqual({ foo:'a' });
			expect(exec('/a/b', '/:foo*', {})).toEqual({ foo:'a/b' });
			expect(exec('/a/b/c', '/:foo*', {})).toEqual({ foo:'a/b/c' });
		});

		it('should match required splat param segments', () => {
			expect(exec('/', '/:foo+', {})).toEqual(false);
			expect(exec('/a', '/:foo+', {})).toEqual({ foo:'a' });
			expect(exec('/a/b', '/:foo+', {})).toEqual({ foo:'a/b' });
			expect(exec('/a/b/c', '/:foo+', {})).toEqual({ foo:'a/b/c' });
		});
	});
});
