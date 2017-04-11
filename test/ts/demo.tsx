import { h, render, Component } from 'preact';
import { Router, route, RouterProps } from '../../src';

history.replaceState(0, '', '/');

function search(query: string) {
  route(`/profile?q=${encodeURIComponent(query)}`);
}

/** Stateless app */
const App = () => (
  <div class="app">
    <Header />
    <Router>
      <Home path="/" />
      <Profile path="/profile/:user?" />
      <Error type="404" default />
    </Router>
  </div>
);

/** demo header nav+search */
const Header = () => (
  <header>
    <nav>
      <a href="/">Home</a>
      <a href="/profile">Profile</a>
      <a href="/profile/john">John</a>
      <a href="/asdf">Error</a>
    </nav>
    <input
      type="search"
      placeholder="Search..."
      onSearch={e => search((e.target as HTMLInputElement).value)}
    />
  </header>
);

/** our index route */

interface HomeProps extends RouterProps {}

interface HomeState { text?: string; }

class Home extends Component<HomeProps, HomeState> {
  setText = (e: Event) => {
    this.setState({ text: (e.target as HTMLInputElement).value });
  }

  render({}: Object, { text = 'Some Text' }: HomeState) {
    return (
      <section class="home">
        <input value={text} onInput={this.setText} />
        <div>In caps: {text.toUpperCase()}</div>
      </section>
    );
  }
}

/** handles /profile and /profile/:user */

interface ProfileProps extends RouterProps {
  user?: string;
}

const Profile = ({ user, ...props }: ProfileProps) => (
  <section class="profile">
    <h2>Profile: {user || 'you'}</h2>
    <p>This is some text about {user || 'you'}.</p>
    <pre>{JSON.stringify({ user, ...props }, null, '  ')}</pre>
  </section>
);

/** fall-back route (handles unroutable URLs) */

interface ErrorProps extends RouterProps {
  type: string;
  url?: string;
}

const Error = ({ type, url }: ErrorProps) => (
  <section class="error">
    <h2>Error {type}</h2>
    <p>It looks like we hit a snag.</p>
    <pre>{url}</pre>
  </section>
);

render(<App />, document.body);