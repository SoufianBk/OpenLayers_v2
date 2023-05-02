import React from "react";
import './App.css';
import MyMap from "./MyMap";
import MapJSONdb from "./MapJSONdb";
import MapMVT from "./MapMVT"
import Test2 from "./MapComponent"
import Geo from "./Geo";
import 'ol/ol.css';

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
                <MapJSONdb></MapJSONdb>
                {/*<MapMVT></MapMVT>*/}
            </div>
        );
    }
}

export default App;
