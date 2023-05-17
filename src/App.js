import React from "react";
import './App.css';
import MyMap from "./MyMap";
import MapJSONdb from "./MapJSONdb";
import MapMVT from "./MapMVT"
import Geo from "./Geo";
import 'ol/ol.css';
import FPSStats from "react-fps-stats";


class App extends React.Component {

    // Constructor
    constructor(props) {
        super(props);
    }

    componentDidMount() {
    }

    render() {
        return (
            <div>
                <Geo></Geo>
                {/*<MyMap></MyMap>*/}
                {/*<MapJSONdb></MapJSONdb>*/}
                <MapMVT></MapMVT>
                <FPSStats />
            </div>
        );
    }
}

export default App;
