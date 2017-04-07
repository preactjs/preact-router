(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory(require('preact')) :
	typeof define === 'function' && define.amd ? define(['preact'], factory) :
	(global.async = factory(global.preact));
}(this, (function (preact) { 'use strict';

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var AsyncRoute = function (_Component) {
	_inherits(AsyncRoute, _Component);

	function AsyncRoute() {
		_classCallCheck(this, AsyncRoute);

		var _this = _possibleConstructorReturn(this, _Component.call(this));

		_this.state = {
			componentData: null
		};
		return _this;
	}

	AsyncRoute.prototype.componentDidMount = function componentDidMount() {
		var _this2 = this;

		var componentData = this.props.component(this.props.url, function (_ref) {
			var component = _ref.component;

			// Named param for making callback future proof
			if (component) {
				_this2.setState({
					componentData: component
				});
			}
		});

		// In case returned value was a promise
		if (componentData && componentData.then) {
			componentData.then(function (component) {
				_this2.setState({
					componentData: component
				});
			});
		}
	};

	AsyncRoute.prototype.render = function render() {
		return this.state.componentData ? preact.h(this.state.componentData, { url: this.props.url, matches: this.props.matches }) : null;
	};

	return AsyncRoute;
}(preact.Component);

return AsyncRoute;

})));
//# sourceMappingURL=index.js.map
