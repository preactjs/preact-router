import { h, render, Component, FunctionalComponent } from 'preact';
import Router, { Route, RoutableProps } from '../';

class ClassComponent extends Component<{}, {}> {
    render() {
        return <div></div>;
    }
}

const SomeFunctionalComponent: FunctionalComponent<{}> = ({}) => {
    return <div></div>;
};

function FunctionalComponentWithoutAnnotation() {
    return <div />;
}

function RouterWithComponents() {
    return (
        <Router>
            <div default></div>
            <ClassComponent default />
            <SomeFunctionalComponent default />
            <FunctionalComponentWithoutAnnotation default />
            <div path="/a"></div>
            <ClassComponent path="/b" />
            <SomeFunctionalComponent path="/c" />
        </Router>
    )
}

function RouterWithRoutes() {
    return (
        <Router>
            <Route default component={ClassComponent} />
            <Route default component={SomeFunctionalComponent} />
            <Route path="/a" component={ClassComponent} />
            <Route path="/b" component={SomeFunctionalComponent} />
        </Router>
    );
}