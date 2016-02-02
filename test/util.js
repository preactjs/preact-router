import { exec, pathRankSort, segmentize, rank, strip } from '../src/util';
import { expect } from 'chai';

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
});
