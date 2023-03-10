import React, {Component, useEffect, useRef, useState} from "react";
import Map from "ol/Map";
import {getVectorContext} from "ol/render";
import View from "ol/View";
import GeoJSON from "ol/format/GeoJSON";
import MVT from "ol/format/MVT";
import MultiPoint from "ol/geom/MultiPoint";
import TileLayer from "ol/layer/Tile";
import VectorLayer from "ol/layer/Vector";
import SourceOSM from "ol/source/OSM";
import VectorSource from "ol/source/Vector";
import Style from "ol/style/Style";
import Stroke from "ol/style/Stroke";
import Circle from "ol/style/Circle";
import Fill from "ol/style/Fill";

function MapMVT() {
    const [error, setError] = useState(null);
    const [isLoaded, setIsLoaded] = useState(false);
    const [items, setItems] = useState([]);
    const [map, setMap] = useState([]);

    useEffect(() => {
        fetch("http://localhost:3001/mvt")
            .then(res => res.json())
            .then(
                (result) => {
                    setIsLoaded(true);
                    setItems(result);
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

        let trip0 = items[0].mvt;
        console.log(trip0)

        let vectorSource = new VectorSource({
            features: new MVT().readFeatures(trip0),  // big JSON file
        });

        // for (var i = 1; i < 10; i++) {
        //     let trip = items[i].asmfjson;
        //     vectorSource.addFeature(new MVT().readFeature(trip))
        //     // console.log(trip)
        // }


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
        let tmp = 0
        let map2 = map
        vectorLayer.on('postrender', function (event) {
            const vectorContext = getVectorContext(event);
            tmp = tmp + 1

            features = vectorSource.getFeatures();
            // console.log(features.length)
            var first = features[0]

            let coordinates = [];

            features.forEach((feature) => {
                if (feature.getGeometry().getCoordinates().length > tmp) {
                    coordinates.push(feature.getGeometry().getCoordinates()[tmp])
                }
            });


            vectorContext.setStyle(ptStyle);
            vectorContext.drawGeometry(new MultiPoint(coordinates));

            if (tmp < 1200) {
                map2.render()
            } else {
                console.log(tmp)
            }
        });

        return (
            <div ref={mapElement} className="map-container" style={{width: "100%", height: "1050px"}}></div>
        );
    }
}


export default MapMVT;