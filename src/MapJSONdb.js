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
import TimeSlider from "./TimeSlider/TimeSlider"
import {Control} from "ol/control";

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

    var interval;

    class Slider extends Control {
        constructor(min, max) {
            const ts = document.createElement('div')
            ts.id = "tsText"
            ts.innerHTML = new Date(min * 1000)

            const playBtn = document.createElement('button')
            playBtn.id = "playBtn"
            playBtn.innerHTML = "P"
            const stopBtn = document.createElement('button')
            stopBtn.id = "stopBtn"
            stopBtn.innerHTML = "S"

            const slider = document.createElement('input');
            slider.id = "timeSlider"
            slider.type = "range"
            slider.min = min
            slider.max = max
            slider.oninput = function (){
                ts.innerHTML = new Date(this.value * 1000)
            }

            const element = document.createElement('div');
            element.className = 'ol-unselectable ol-control';
            element.appendChild(ts);
            element.appendChild(playBtn);
            element.appendChild(stopBtn);
            element.appendChild(slider);

            super({
                element: element,
            });

            playBtn.addEventListener('click', this.handlePlayBtn.bind(this), false);
            stopBtn.addEventListener('click', this.handleStopBtn.bind(this), false);
        }

        myTimer(){
            let slider = document.getElementById("timeSlider")
            let tmp = parseInt(slider.value) + 60;
            if(tmp <= slider.max){
                slider.value = tmp
                let ts = document.getElementById("tsText")
                ts.innerHTML = new Date(tmp * 1000)
            }
        }

        handlePlayBtn(){
            interval = setInterval(this.myTimer, 10)
            this.disablePlayBtn()
            this.enableStopBtn()
            console.log("PLAY")
        }

        handleStopBtn(){
            clearInterval(interval)
            this.enablePlayBtn()
            this.disableStopBtn()
            console.log("STOP")
        }

        disablePlayBtn(){
            let btn = document.getElementById("playBtn")
            btn.disabled = true
        }

        enablePlayBtn(){
            let btn = document.getElementById("playBtn")
            btn.disabled = false
        }

        disableStopBtn(){
            let btn = document.getElementById("stopBtn")
            btn.disabled = false
        }
        enableStopBtn(){
            let btn = document.getElementById("stopBtn")
            btn.disabled = false
        }

    }


    if (!isLoaded) {
        console.log("Loading ...")
        return <div ref={mapElement} className="map-container" style={{width: "100%", height: "1050px"}}></div>;
    } else {
        console.log("Ready")
        let vectorSource = new VectorSource();
        let test = items;
        console.log(items.length)

        for (var i = 0; i < 100  /* items.length*/ ; i++) {
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

        let tsMin = toTimestamp(timestamps[0].min)
        let tsMax = toTimestamp(timestamps[0].max)

        map.addControl(new Slider(tsMin, tsMax))

        let features
        let j = 0
        let map2 = map
        let nbTotTs = tsMax - tsMin
        let currentTs = tsMin;

        let currentCoord = 0;
        vectorLayer.on('postrender', function (event) {
            if (currentTs < tsMax) {
                const vectorContext = getVectorContext(event);
                features = vectorSource.getFeatures();
                let coordinates = [];

                currentTs = currentTs + 60;
                features.forEach((feature) => {
                    currentCoord = feature.get("currentCoord")
                    let tsTmp = feature.get("timestamp")[currentCoord]
                    let currentTmp = feature.getGeometry().getCoordinates()[currentCoord]
                    if (typeof currentTmp === 'undefined') {
                        // coordinates.push(feature.getGeometry().getCoordinates()[currentCoord - 1])
                    } else {
                        if (currentTs > tsTmp) {
                            coordinates.push(currentTmp)
                            while (currentTs > tsTmp) {
                                currentCoord = currentCoord + 1;
                                tsTmp = feature.get("timestamp")[currentCoord]
                            }
                            feature.set("currentCoord", currentCoord)
                        } else {
                            coordinates.push(currentTmp)
                        }
                    }
                });
                vectorContext.setStyle(ptStyle);
                vectorContext.drawGeometry(new MultiPoint(coordinates));

                j = j + 60
                if (j - 120 < nbTotTs) {
                    map2.render()
                }
            }
        });

        return (
            <div ref={mapElement} className="map-container" style={{width: "100%", height: "1050px"}}/>
        );
    }

    // console.log(items)
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