import { cloneElement } from 'preact';

export default function assertCloneOf({ Assertion }) {
	if (Assertion.__assertCloneOfMounted === true) return;
	Assertion.__assertCloneOfMounted = true;

	Assertion.addMethod('cloneOf', function(routeJsx, { matches = {}, url = this._obj.props.path } = {}) {
		const vnode = this._obj;
		const clonedRoute = cloneElement(routeJsx, { url, matches, ...matches });
		new chai.Assertion(vnode).to.be.eql(clonedRoute);
	});
}
