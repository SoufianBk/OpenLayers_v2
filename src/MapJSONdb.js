import React, {Component, useEffect, useRef, useState} from "react";
import Map from "ol/Map";
import View from "ol/View";
import LayerTile from "ol/layer/Tile";
import SourceOSM from "ol/source/OSM";
import Vector from "ol/source/Vector";
import GeoJSON from "ol/format/GeoJSON";
import VectorLayer from "ol/layer/Vector";
import Style from "ol/style/Style";
import Stroke from "ol/style/Stroke";
import Circle from "ol/style/Circle";
import Fill from "ol/style/Fill";
import VectorSource from "ol/source/Vector";
import {getVectorContext} from "ol/render";
import MultiPoint from "ol/geom/MultiPoint";
import TileLayer from "ol/layer/Tile";
import {Feature} from "ol";

function MapJSONdb() {
    const [error, setError] = useState(null);
    const [isLoaded, setIsLoaded] = useState(false);
    const [items, setItems] = useState([]);
    const [timestamps, setTimestamps] = useState([]);
    const [map, setMap] = useState([]);

    useEffect(() => {
        fetch("http://localhost:3001/json")
            .then(res => res.json())
            .then(
                (result) => {
                    setIsLoaded(true);
                    setItems(result);
                }
            )
    }, [])

    useEffect(() => {
        fetch("http://localhost:3001/json/ts")
            .then(res => res.json())
            .then(
                (result) => {
                    setTimestamps(result);
                }
            )
    }, [])

    const mapElement = useRef()
    const mapRef = useRef()
    mapRef.current = map

    useEffect(() => {
        // create map
        const initialMap = new Map({
            target: mapElement.current,
            layers: [
                new TileLayer({
                    source: new SourceOSM()
                }),
            ],
            view: new View({
                center: [12, 55],
                zoom: 6
            }),
            controls: []
        })

        setMap(initialMap)

    }, [])

    // console.log(items)

    if (!isLoaded) {
        console.log("Loading ...")
        return <div ref={mapElement} className="map-container" style={{width: "100%", height: "1050px"}}></div>;
    } else {
        console.log("Ready")
        let vectorSource = new VectorSource();
        let test = items;

        for (var i = 0; i < 500; i++) {
            let trip = items[i].asmfjson;
            trip.type = "LineString"
            let timestampsZ = trip.datetimes.map(element => (Math.round(toTimestamp(rectifyFormat(element)))));
            let ft = new GeoJSON().readFeature(trip);
            ft.set('timestamp', timestampsZ)
            ft.set('currentCoord', 0)

            vectorSource.addFeature(ft)
        }

        let vectorLayer = new VectorLayer({
            source: vectorSource,
            style: new Style({
                stroke: new Stroke({
                    color: 'rgba(255, 255, 255, 0)'
                })
            })
        });

        map.addLayer(vectorLayer);

        const ptStyle = new Style({
            image: new Circle({
                radius: 3,
                fill: new Fill({color: 'yellow'}),
                stroke: new Stroke({color: 'red', width: 1}),
            }),
        });

        let features
        let j = 0
        let map2 = map
        let tsMin = toTimestamp(timestamps[0].min)
        let tsMax = toTimestamp(timestamps[0].max)
        let nbTotTs = tsMax - tsMin
        let currentTs = tsMin;
        let currentCoord = 0;
        vectorLayer.on('postrender', function (event) {
            const vectorContext = getVectorContext(event);
            features = vectorSource.getFeatures();
            let coordinates = [];

            currentTs = currentTs + 1;
            features.forEach((feature) => {
                currentCoord = feature.get("currentCoord")
                if (currentTs == feature.get("timestamp")[currentCoord]) {
                    coordinates.push(feature.getGeometry().getCoordinates()[currentCoord])
                    feature.set("currentCoord", currentCoord + 1)
                } else {
                    coordinates.push(feature.getGeometry().getCoordinates()[currentCoord])
                }
            });

            vectorContext.setStyle(ptStyle);
            vectorContext.drawGeometry(new MultiPoint(coordinates));

            j = j + 1
            if (j < nbTotTs) {
                map2.render()
                console.log(new Date(currentTs * 1000))
                console.log(currentTs)
            } else {
                console.log(currentTs)
            }
        });

        return (
            <div ref={mapElement} className="map-container" style={{width: "100%", height: "1050px"}}></div>
        );
    }
}

const toTimestamp = (strDate) => {
    const dt = Date.parse(strDate);
    return dt / 1000;
}

function rectifyFormat(s) {
    let b = s.split(/\D/);
    return b[0] + '-' + b[1] + '-' + b[2] + 'T' +
        b[3] + ':' + b[4] + ':' + b[5] + '.' +
        b[6].substr(0, 3) + '+00:00';
}

export default MapJSONdb;