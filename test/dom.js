import { Router, Link, route } from 'src';
import { Match, Link as ActiveLink } from 'src/match';
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
		mount = jsx => {render(jsx, scratch); return scratch.lastChild;};
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
				mount(<Link href="/foo" bar="baz">hello</Link>).outerHTML
			).to.eql(
				mount(<a href="/foo" bar="baz">hello</a>).outerHTML
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

		it('should not carry over the previous value of a query parameter', () => {
			class A {
				render({ bar }){ return <p>bar is {bar}</p>; }
			}
			let routerRef;
			mount(
				<Router ref={r => routerRef = r}>
					<A path="/foo" />
				</Router>
			);
			route('/foo');
			expect(routerRef.base.outerHTML).to.eql('<p>bar is </p>');
			route('/foo?bar=5');
			expect(routerRef.base.outerHTML).to.eql('<p>bar is 5</p>');
			route('/foo');
			expect(routerRef.base.outerHTML).to.eql('<p>bar is </p>');
		});
	});
	
	describe('preact-router/match', () => {
		describe('<Match>', () => {
			it('should invoke child function with match status when routing', done => {
				let spy1 = sinon.spy(),
					spy2 = sinon.spy();
				mount(
					<div>
						<Router />
						<Match path="/foo">{spy1}</Match>
						<Match path="/bar">{spy2}</Match>
					</div>
				);
				
				expect(spy1, 'spy1 /foo').to.have.been.calledOnce.and.calledWithMatch({ matches: false, path:'/', url:'/' });
				expect(spy2, 'spy2 /foo').to.have.been.calledOnce.and.calledWithMatch({ matches: false, path:'/', url:'/' });
				
				spy1.reset();
				spy2.reset();
				
				route('/foo');
				
				setTimeout( () => {
					expect(spy1, 'spy1 /foo').to.have.been.calledOnce.and.calledWithMatch({ matches: true, path:'/foo', url:'/foo' });
					expect(spy2, 'spy2 /foo').to.have.been.calledOnce.and.calledWithMatch({ matches: false, path:'/foo', url:'/foo' });
					spy1.reset();
					spy2.reset();
					
					route('/foo?bar=5');

					setTimeout( () => {
						expect(spy1, 'spy1 /foo?bar=5').to.have.been.calledOnce.and.calledWithMatch({ matches: true, path:'/foo', url:'/foo?bar=5' });
						expect(spy2, 'spy2 /foo?bar=5').to.have.been.calledOnce.and.calledWithMatch({ matches: false, path:'/foo', url:'/foo?bar=5' });
						spy1.reset();
						spy2.reset();

						route('/bar');
						
						setTimeout( () => {
							expect(spy1, 'spy1 /bar').to.have.been.calledOnce.and.calledWithMatch({ matches: false, path:'/bar', url:'/bar' });
							expect(spy2, 'spy2 /bar').to.have.been.calledOnce.and.calledWithMatch({ matches: true, path:'/bar', url:'/bar' });
							
							done();
						}, 20);
					}, 20);
				}, 20);
			});
		});

		describe('<Link>', () => {
			it('should render with active class when active', done => {
				mount(
					<div>
						<Router />
						<ActiveLink activeClassName="active" path="/foo">foo</ActiveLink>
						<ActiveLink activeClassName="active" class="bar" path="/bar">bar</ActiveLink>
					</div>
				);
				route('/foo');
				
				setTimeout( () => {
					expect(scratch.innerHTML).to.eql('<div><a class="active">foo</a><a class="bar">bar</a></div>');

					route('/foo?bar=5');

					setTimeout( () => {
						expect(scratch.innerHTML).to.eql('<div><a class="active">foo</a><a class="bar">bar</a></div>');

						route('/bar');

						setTimeout( () => {
							expect(scratch.innerHTML).to.eql('<div><a class="">foo</a><a class="bar active">bar</a></div>');
							
							done();
						});
					});
				});
			});
		});
	});
});
