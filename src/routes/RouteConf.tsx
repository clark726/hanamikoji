import React from "react";
import {useRoutes} from "react-router-dom";
import GamePage from "../page/GamePage";

const routes = [
    {path: "/", element: <GamePage/>},

];


const RouteConf = () => {
    const routeConfig = useRoutes(routes);
    return routeConfig;
};

export default RouteConf;
