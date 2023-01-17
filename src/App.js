import React, { useState, useEffect, useRef } from 'react';
import 'ol/ol.css';
import {useGeographic} from "ol/proj";
import MyMap from "./MyMap";

function App() {
    const geo = useGeographic()

    const [merchants, setMerchants] = useState(false);
    useEffect(() => {
        getMerchant();
    }, []);
    function getMerchant() {
        fetch('http://localhost:3001')
            .then(response => {
                return response.text();
            })
            .then(data => {
                setMerchants(data);
            });
    }

    return (
        <div>
            {/*<MyMap />*/}
            {merchants ? merchants : 'There is no merchant data available'}
        </div>
    );
}

export default App;