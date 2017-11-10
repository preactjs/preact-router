import { h } from 'preact';
import { Link, RoutableProps } from '../';
import { Match } from '../match';

function ChildComponent({}: {}) {
    return <div></div>;
}

function LinkComponent({}: {}) {
    return (
        <div>
            <Link href="/a" />
            <Link activeClassName="active" href="/b" />
        </div>
    );
}

function MatchComponent({}: {}) {
    return (
        <Match path="/b">
            {({ matches, path, url }) => matches && (
                <ChildComponent />
            )}
        </Match>
    );
}