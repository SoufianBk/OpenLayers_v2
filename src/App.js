import React from "react";
import './App.css';
import MyMap from "./MyMap";
import MapJSONdb from "./MapJSONdb";
import Test from "./Test";
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
                {/*<MapJSONdb></MapJSONdb>*/}
                <Test></Test>
            </div>
        );
    }
}

export default App;
