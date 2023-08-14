import React from "react";
import MapMVT from "./mvt/MapMVT"
import MapJSON from "./mfjson/MapJSON";
import Geo from "./Geo";
import 'ol/ol.css';
import FPSStats from "react-fps-stats";

var isJSON = true;

class App extends React.Component {

    constructor(props) {
        super(props);
    }

    componentDidMount() {
    }

    render() {
        if(isJSON){
            return (
                <div>
                    <Geo></Geo>
                    <MapJSON></MapJSON>
                    <FPSStats />
                </div>
            );
        } else{
            return (
                <div>
                    <Geo></Geo>
                    <MapMVT></MapMVT>
                    <FPSStats />
                </div>
            );
        }
    }
}

export default App;
