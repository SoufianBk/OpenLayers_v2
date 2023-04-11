import React, { useState, useEffect, useRef } from 'react';
import { Map, View } from 'ol';
import { MVT } from 'ol/format';
import { VectorTile } from 'ol/source';
import { Vector as VectorLayer } from 'ol/layer';
import { fromLonLat } from 'ol/proj';
import 'ol/ol.css';
import Style from "ol/style/Style";
import Circle from "ol/style/Circle";
import Fill from "ol/style/Fill";
import Stroke from "ol/style/Stroke";

function MapComponent() {
    const [map, setMap] = useState(null);
    const [layer, setLayer] = useState(null);
    const mapElement = useRef(null);
    const [time, setTime] = useState(0);

    useEffect(() => {
        const initialMap = new Map({
            target: mapElement.current,
            layers: [],
            view: new View({
                center: fromLonLat([-122.4167, 37.7833]),
                zoom: 10,
            }),
        });
        setMap(initialMap);
        return () => {
            if (initialMap) {
                initialMap.dispose();
            }
        };
    }, []);

    useEffect(() => {
        if (map) {
            const vectorTile = new VectorTile({
                format: new MVT(),
                url: `http://localhost:7800/public.tripsl/{z}/{x}/{y}.pbf?limit=10`,
            });

            const vectorLayer = new VectorLayer({
                source: vectorTile,
            });

            setLayer(vectorLayer);
            map.addLayer(vectorLayer);
        }
    }, [map]);

    useEffect(() => {
        if (layer) {
            layer.setStyle((feature) => {
                // Here you can define a style function that updates based on the time state
                // For example, you can color the points based on their age, or animate the movement
                // of a line based on its timestamps.
                const timestamp = feature.get('timestamp');
                const age = (time - timestamp) / 1000;
                const color = age > 60 ? 'red' : 'green';
                return new Style({
                    image: new Circle({
                        radius: 5,
                        fill: new Fill({
                            color: color,
                        }),
                        stroke: new Stroke({
                            color: 'black',
                            width: 2,
                        }),
                    }),
                });
            });
        }
    }, [layer, time]);

    useEffect(() => {
        const interval = setInterval(() => {
            setTime((prevTime) => prevTime + 1000);
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    return <div ref={mapElement} style={{ width: '100%', height: '500px' }} />;
}

export default MapComponent;
