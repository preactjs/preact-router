import { exec, pathRankSort, prepareVNodeForRanking, segmentize, rank } from 'src/util';

const strip = str => segmentize(str).join('/');

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
		it('should return rank of path segments', () => {
			expect(rank('')).to.equal('5');
			expect(rank('/')).to.equal('5');
			expect(rank('//')).to.equal('5');
			expect(rank('a/b/c')).to.equal('555');
			expect(rank('/a/b/c/')).to.equal('555');
			expect(rank('/:a/b?/:c?/:d*/:e+')).to.eql('45312');
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
		it('should sort by highest rank first', () => {
			let paths = arr => arr.map( path => ({ props:{path}} ) );
			let clean = vnode => { delete vnode.rank; delete vnode.index; return vnode; };

			expect(
				paths(['/:a*', '/a', '/:a+', '/:a?', '/a/:b*']).filter(prepareVNodeForRanking).sort(pathRankSort).map(clean)
			).to.eql(
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
			).to.eql(
				paths(['/a/b/', '/a/b', '/', 'b']).concat(defaultPath)
			);
		});
	});

	describe('exec', () => {
		it('should match explicit equality', () => {
			expect(exec('/','/', {})).to.eql({});
			expect(exec('/a', '/a', {})).to.eql({});
			expect(exec('/a', '/b', {})).to.eql(false);
			expect(exec('/a/b', '/a/b', {})).to.eql({});
			expect(exec('/a/b', '/a/a', {})).to.eql(false);
			expect(exec('/a/b', '/b/b', {})).to.eql(false);
		});

		it('should match param segments', () => {
			expect(exec('/', '/:foo', {})).to.eql(false);
			expect(exec('/bar', '/:foo', {})).to.eql({ foo:'bar' });
		});

		it('should match optional param segments', () => {
			expect(exec('/', '/:foo?', {})).to.eql({ foo:'' });
			expect(exec('/bar', '/:foo?', {})).to.eql({ foo:'bar' });
			expect(exec('/', '/:foo?/:bar?', {})).to.eql({ foo:'', bar:'' });
			expect(exec('/bar', '/:foo?/:bar?', {})).to.eql({ foo:'bar', bar:'' });
			expect(exec('/bar', '/:foo?/bar', {})).to.eql(false);
			expect(exec('/foo/bar', '/:foo?/bar', {})).to.eql({ foo:'foo' });
		});

		it('should match splat param segments', () => {
			expect(exec('/', '/:foo*', {})).to.eql({ foo:'' });
			expect(exec('/a', '/:foo*', {})).to.eql({ foo:'a' });
			expect(exec('/a/b', '/:foo*', {})).to.eql({ foo:'a/b' });
			expect(exec('/a/b/c', '/:foo*', {})).to.eql({ foo:'a/b/c' });
		});

		it('should match required splat param segments', () => {
			expect(exec('/', '/:foo+', {})).to.eql(false);
			expect(exec('/a', '/:foo+', {})).to.eql({ foo:'a' });
			expect(exec('/a/b', '/:foo+', {})).to.eql({ foo:'a/b' });
			expect(exec('/a/b/c', '/:foo+', {})).to.eql({ foo:'a/b/c' });
		});
	});
});
