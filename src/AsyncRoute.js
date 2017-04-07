import { h, Component } from 'preact';

class AsyncRoute extends Component {
	constructor() {
		super();
		this.state = {
			componentData: null
		};
	}
	componentDidMount(){
		const componentData = this.props.component(this.props.url, ({component}) => {
            // Named param for making callback future proof
			if (component) {
				this.setState({
					componentData: component
				});
			}
		});

		// In case returned value was a promise
		if (componentData && componentData.then) {
			componentData.then(component => {
				this.setState({
					componentData: component
				});
			});
		}
	}
	render(){
		return this.state.componentData ?
			h(this.state.componentData, { url: this.props.url, matches: this.props.matches }) :
			null;
	}
}

export default AsyncRoute;