import React from 'react';
import './App.css';
import {Provider} from "react-redux";
import {BrowserRouter} from "react-router-dom";
import store from "./store/store";
import RouteConf from "./routes/RouteConf";

function App() {
    return (
        <>
            <Provider store={store}>
                <BrowserRouter>
                    <RouteConf/>
                </BrowserRouter>
            </Provider>
        </>
    );
}

export default App;
