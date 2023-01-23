import React from "react";
import './App.css';
import MyMap from "./MyMap";
import 'ol/ol.css';
import {useGeographic} from "ol/proj";

class App extends React.Component {

    // Constructor
    constructor(props) {
        super(props);


        this.state = {
            items: [],
            DataisLoaded: false
        };
    }

    // ComponentDidMount is used to
    // execute the code
    componentDidMount() {
        fetch(
            "http://localhost:3001")
            .then((res) => res.json())
            .then((json) => {
                this.setState({
                    items: json,
                    DataisLoaded: true
                });
            })
    }
    render() {
        const { DataisLoaded, items } = this.state;
        if (!DataisLoaded) return <div>
            <h1> Pleses wait some time.... </h1> </div> ;


        let div = [];
        for (var i = 0; i < 10; i++) {
            let tmp = eval('('+ items[i].asmfjson + ')');
            console.log(tmp)
            // console.log(typeof tmp)
        }


        return (
            <div>
                <MyMap></MyMap>
            </div>
        );
    }
}

export default App;
