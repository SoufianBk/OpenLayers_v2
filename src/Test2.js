import React, {Component, useEffect, useRef, useState} from "react";
import Map from "ol/Map";
import View from "ol/View";
import MVT from "ol/format/MVT";
import VectorTileLayer from "ol/layer/VectorTile";
import VectorTileSource from 'ol/source/VectorTile';
import {Fill, Icon, Stroke, Style, Text} from 'ol/style.js';
import {createMapboxStreetsV6Style} from "./v6"


function Test2() {
    const [map, setMap] = useState([]);
    const [isLoaded, setIsLoaded] = useState(false);

    const mapElement = useRef()
    const mapRef = useRef()
    mapRef.current = map

    useEffect(() => {
        // create map
        const initialMap = new Map({
            layers: [
                new VectorTileLayer({
                    declutter: true,
                    source: new VectorTileSource({
                        attributions:
                            '© <a href="https://www.mapbox.com/map-feedback/">Mapbox</a> ' +
                            '© <a href="https://www.openstreetmap.org/copyright">' +
                            'OpenStreetMap contributors</a>',
                        format: new MVT(),
                        url:
                            'https://api.mapbox.com/v4/mapbox.mapbox-streets-v8/{z}/{x}/{y}.mvt?access_token=pk.eyJ1Ijoid2F6eXN0YXRzIiwiYSI6ImNsZTVoc3E1ZTA5c3QzdnM0dGczbnl2NXgifQ.RdsCypYt4CqvhpIuhjaX4Q',
                    }),
                    style: createMapboxStreetsV6Style(Style, Fill, Stroke, Icon, Text),
                }),
            ],
            target: 'map',
            view: new View({
                center: [0, 0],
                zoom: 1,
            })
        })
        setMap(initialMap)
        setIsLoaded(true);
    }, [])

    return <div id="map" className="map" style={{width: "100%", height: "1050px"}}></div>;

}

export default Test2;