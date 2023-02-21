import React, {Component, useEffect, useRef, useState} from "react";
import Map from "ol/Map";
import View from "ol/View";
import MVT from "ol/format/MVT";
import TileLayer from "ol/layer/Tile";
import VectorLayer from "ol/layer/Vector";
import SourceOSM from "ol/source/OSM";
import Vector from "ol/source/Vector";
import VectorTileLayer from "ol/layer/VectorTile";
import VectorTileSource from 'ol/source/VectorTile';
import MapboxVector from 'ol/layer/MapboxVector.js';
import {Fill, Circle, Stroke, Style, Text} from 'ol/style.js';

function yourStyleFunction(feature, resolution) {
    return [new Style({
        fill: new Fill({
            color: 'rgba(255, 255, 255, 0.2)'
        }),
        stroke: new Stroke({
            color: '#319FD3',
            width: 2
        }),
        image: new Circle({
            radius: 7,
            fill: new Fill({
                color: '#319FD3'
            })
        })
    })];
}


function Test() {
    const [map, setMap] = useState([]);
    const [isLoaded, setIsLoaded] = useState(false);

    const mapElement = useRef()
    const mapRef = useRef()
    mapRef.current = map

    useEffect(() => {
        // create map
        const initialMap = new Map({
            target: 'map',
            layers: [
                new TileLayer({
                    source: new SourceOSM()
                }),
                new VectorTileLayer({
                    declutter: true,
                    source: new VectorTileSource({
                        format: new MVT(),
                        defaultDataProject: 'ESPG:4326',
                        url: 'https://api.mapbox.com/v4/mapbox.mapbox-streets-v8/{z}/{x}/{y}.mvt?access_token=pk.eyJ1Ijoid2F6eXN0YXRzIiwiYSI6ImNsZTVoc3E1ZTA5c3QzdnM0dGczbnl2NXgifQ.RdsCypYt4CqvhpIuhjaX4Q'
                    }),
                    style: yourStyleFunction
                }),
            ],
            view: new View({
                center: [0, 0],
                zoom: 2
            }),
            controls: []
        })

        setMap(initialMap)
        setIsLoaded(true);
    }, [])

    return <div id="map" className="map" style={{width: "100%", height: "1050px"}}></div>

    // if (!isLoaded) {
    //     console.log("Loading ...")
    //     // return <div ref={mapElement} className="map-container" style={{width: "100%", height: "1050px"}}></div>;
    //     return <div id="map" className="map" style={{width: "100%", height: "1050px"}}></div>
    // } else {
    //     console.log("Ready")
    //     return <div id="map" className="map" style={{width: "100%", height: "1050px"}}></div>
    // }
    //     var file = 'https://api.mapbox.com/v4/mapbox.mapbox-streets-v8/1/0/0.mvt?access_token=pk.eyJ1Ijoid2F6eXN0YXRzIiwiYSI6ImNsZTVoc3E1ZTA5c3QzdnM0dGczbnl2NXgifQ.RdsCypYt4CqvhpIuhjaX4Q';
    //     // '../src/PostGIS-trips.mvt'
    //
    //     console.log(file)
    //
    //     var source = new Vector({
    //         url: file,
    //         format: new MVT()
    //     });
    //
    //     var layer = new VectorLayer({
    //         source: source,
    //         style: new Style({
    //             stroke: new Stroke({
    //                 color: 'rgba(255, 255, 255, 0)'
    //             })
    //         })
    //     });
    //
    //     map.addLayer(layer);
    //     return <div ref={mapElement} className="map-container" style={{width: "100%", height: "1050px"}}></div>;
    // }

}


export default Test;