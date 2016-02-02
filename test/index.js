import { Router, Link, route } from '../src';
import { h, Component } from 'preact';
import { expect, use } from 'chai';
import { spy, match } from 'sinon';
import sinonChai from 'sinon-chai';
use(sinonChai);
/** @jsx h */

describe('preact-router', () => {
	it('should export Router, Link and route', () => {
		expect(Router).to.be.a('function');
		expect(Link).to.be.a('function');
		expect(route).to.be.a('function');
	});

	describe('Router', () => {
		it('should filter children based on URL', () => {
			let router = new Router();
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
			let router = new Router();
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
			let router = new Router();
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
	});
});
