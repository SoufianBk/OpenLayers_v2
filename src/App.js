import React, { useState, useEffect, useRef } from 'react';
import 'ol/ol.css';
import {useGeographic} from "ol/proj";
import MyMap from "./MyMap";

function App() {
    const geo = useGeographic()
    return (
        <div>
            <MyMap />
        </div>
    );
}

export default App;