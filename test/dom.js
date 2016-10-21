import { Router, Link, route } from 'src';
import { h, render } from 'preact';

const Empty = () => null;

function fireEvent(on, type) {
	let e = document.createEvent('Event');
	e.initEvent(type, true, true);
	on.dispatchEvent(e);
}

describe('dom', () => {
	let scratch, $, mount;

	before( () => {
		scratch = document.createElement('div');
		document.body.appendChild(scratch);
		$ = s => scratch.querySelector(s);
		mount = jsx => render(jsx, scratch, scratch.firstChild);
	});

	beforeEach( () => {
		// manually reset the URL before every test
		history.replaceState(null, null, '/');
		fireEvent(window, 'popstate');
	});

	afterEach( () => {
		mount(<Empty />);
		scratch.innerHTML = '';
	});

	after( () => {
		document.body.removeChild(scratch);
	});

	describe('<Link />', () => {
		it('should render a normal link', () => {
			expect(
				mount(<Link href="/foo" bar="baz">hello</Link>)
			).to.eql(
				mount(<a href="/foo" bar="baz">hello</a>)
			);
		});

		it('should route when clicked', () => {
			let onChange = sinon.spy();
			mount(
				<div>
					<Link href="/foo">foo</Link>
					<Router onChange={onChange}>
						<div default />
					</Router>
				</div>
			);
			onChange.reset();
			$('a').click();
			expect(onChange)
				.to.have.been.calledOnce
				.and.to.have.been.calledWithMatch({ url:'/foo' });
		});
	});

	describe('<a>', () => {
		it('should route for existing routes', () => {
			let onChange = sinon.spy();
			mount(
				<div>
					<a href="/foo">foo</a>
					<Router onChange={onChange}>
						<div default />
					</Router>
				</div>
			);
			onChange.reset();
			$('a').click();
			// fireEvent($('a'), 'click');
			expect(onChange)
				.to.have.been.calledOnce
				.and.to.have.been.calledWithMatch({ url:'/foo' });
		});

		it('should not intercept non-preact elements', () => {
			let onChange = sinon.spy();
			mount(
				<div>
					<div dangerouslySetInnerHTML={{ __html: `<a href="#foo">foo</a>` }} />
					<Router onChange={onChange}>
						<div default />
					</Router>
				</div>
			);
			onChange.reset();
			$('a').click();
			expect(onChange).not.to.have.been.called;
			expect(location.href).to.contain('#foo');
		});
	});

	describe('Router', () => {
		it('should add and remove children', () => {
			class A {
				componentWillMount() {}
				componentWillUnmount() {}
				render(){ return <div />; }
			}
			sinon.spy(A.prototype, 'componentWillMount');
			sinon.spy(A.prototype, 'componentWillUnmount');
			mount(
				<Router>
					<A path="/foo" />
				</Router>
			);
			expect(A.prototype.componentWillMount).not.to.have.been.called;
			route('/foo');
			expect(A.prototype.componentWillMount).to.have.been.calledOnce;
			expect(A.prototype.componentWillUnmount).not.to.have.been.called;
			route('/bar');
			expect(A.prototype.componentWillMount).to.have.been.calledOnce;
			expect(A.prototype.componentWillUnmount).to.have.been.calledOnce;
		});

		it('should support re-routing', done => {
			class A {
				componentWillMount() {
					route('/b');
				}
				render(){ return <div class="a" />; }
			}
			class B {
				componentWillMount(){}
				render(){ return <div class="b" />; }
			}
			sinon.spy(A.prototype, 'componentWillMount');
			sinon.spy(B.prototype, 'componentWillMount');
			mount(
				<Router>
					<A path="/a" />
					<B path="/b" />
				</Router>
			);
			expect(A.prototype.componentWillMount).not.to.have.been.called;
			route('/a');
			expect(A.prototype.componentWillMount).to.have.been.calledOnce;
			A.prototype.componentWillMount.reset();
			expect(location.pathname).to.equal('/b');
			setTimeout( () => {
				expect(A.prototype.componentWillMount).not.to.have.been.called;
				expect(B.prototype.componentWillMount).to.have.been.calledOnce;
				expect(scratch).to.have.deep.property('firstElementChild.className', 'b');
				done();
			}, 10);
		});
	});
});
