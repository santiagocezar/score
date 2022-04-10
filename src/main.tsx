import { Header } from 'components/Header';
import { MatchProvider } from 'games';
import { Home } from 'home/Home';
import { enableMapSet } from 'immer';
import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter, Route, Switch, useParams } from 'react-router-dom';
enableMapSet();

const GameMatchRoute = () => {
    const { id } = useParams<{ id: string; }>();

    return <MatchProvider matchID={id} />;
};


export default function App() {
    return (
        <BrowserRouter>
            <Switch>
                <Route path="/" exact>
                    <Home />
                </Route>
                <Route path="/match/:id">
                    <GameMatchRoute />
                </Route>
            </Switch>
            <Header />
        </BrowserRouter>
    );
}

ReactDOM.render(<App />, document.getElementById('root'));
