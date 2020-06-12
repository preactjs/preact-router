import { subscribers, getCurrentUrl, route, Router, Route, Link, exec, useRouter } from './index';

Router.subscribers = subscribers;
Router.getCurrentUrl = getCurrentUrl;
Router.route = route;
Router.Router = Router;
Router.Route = Route;
Router.Link = Link;
Router.exec = exec;
Router.useRouter = useRouter;

export default Router;
