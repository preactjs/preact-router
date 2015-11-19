import { Router, Route, Link } from '../src';
import { h, Component } from 'preact';
import { expect, use } from 'chai';
import { spy, match } from 'sinon';
import sinonChai from 'sinon-chai';
use(sinonChai);

describe('preact-router', () => {
	describe('Not a Test', () => {
		it('should not be tested yet', () => {
			expect(1).to.equal(1);
		});
	});
});
