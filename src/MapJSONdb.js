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
import {Control} from "ol/control";
import styles from './style.css';
import TimePicker from "react-time-picker";
import * as PropTypes from "prop-types";
import ReactDOM from "react-dom";

const TimePickerControl = ({ initialValue, onTimeChange }) => {
    const [time, setTime] = useState(initialValue);

    const handleTimeChange = (selectedTime) => {
        setTime(selectedTime);
        onTimeChange(selectedTime);
    };

    return (
        <div>
            <TimePicker value={time} onChange={handleTimeChange} clearIcon={null} />
        </div>
    );
};

TimePickerControl.propTypes = {
    initialValue: PropTypes.string,
    onTimeChange: PropTypes.any
};

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
                // center: [-73.949997, 40.650002],
                // center: [4.352551, 50.844311],
                center: [12, 55],
                zoom: 6
                // zoom: 12
            }),
            controls: []
        })

        setMap(initialMap)

    }, [])

    var play = true;
    let map2 = map
    var currentTs = 0

    class Slider extends Control {
        constructor(min, max) {
            const date = document.createElement('div')
            date.id = "dateText"
            date.innerHTML = new Date(min * 1000).toLocaleDateString();
            date.style.fontWeight = 'normal'

            const ts = document.createElement('div')
            ts.id = "tsText"
            ts.innerHTML = new Date(min * 1000).toLocaleTimeString();

            const rangeContainer = document.createElement('div');
            rangeContainer.style.display = 'flex';
            rangeContainer.style.width = "95%";

            const fromTxt = document.createElement('div')
            fromTxt.innerHTML = "From : "

            const minDropdown = document.createElement('select');
            minDropdown.id = "timestampDropdown";

            // Populate the dropdown with timestamps from the range
            for (let i = min; i <= max; i = i + 600) {
                const option = document.createElement('option');
                option.value = i;
                option.textContent = new Date(i * 1000).toLocaleString();
                minDropdown.appendChild(option);
            }

            const toTxt = document.createElement('div')
            toTxt.innerHTML = "  To : "

            const maxDropdown = document.createElement('select');
            maxDropdown.id = "timestampDropdown";

            // Populate the dropdown with timestamps from the range
            for (let i = min; i <= max; i = i + 600) {
                const option = document.createElement('option');
                option.value = i;
                option.textContent = new Date(i * 1000).toLocaleString();
                option.selected = "selected"
                maxDropdown.appendChild(option);
            }

            const refresh = document.createElement('button')
            refresh.id = "refresh"
            refresh.innerHTML = "Refresh"
            refresh.style.width = "70px"
            // refresh.style.color = "white";
            // refresh.style.backgroundColor = "#A0A0A0";

            rangeContainer.appendChild(fromTxt);
            rangeContainer.appendChild(minDropdown);
            rangeContainer.appendChild(toTxt);
            rangeContainer.appendChild(maxDropdown);
            rangeContainer.appendChild(refresh)

            const container = document.createElement('div');
            container.style.display = 'flex';
            container.style.width = "95%";

            const playStopBtn = document.createElement('button')
            playStopBtn.id = "playStopBtn"
            playStopBtn.innerHTML = "S"
            playStopBtn.style.color = "white";
            playStopBtn.style.backgroundColor = "#A0A0A0";

            const slider = document.createElement('input');
            slider.style.color = "red";
            slider.style.flexGrow = 1;
            slider.id = "timeSlider"
            slider.type = "range"
            slider.min = min
            slider.max = max
            slider.oninput = function () {
                date.innerHTML = new Date(this.value * 1000).toLocaleDateString();
                ts.innerHTML = new Date(this.value * 1000).toLocaleTimeString();
                currentTs = parseInt(this.value)
                map2.render()
            }

            container.appendChild(playStopBtn);
            container.appendChild(slider);

            const element = document.createElement('div');
            element.style.backgroundColor = '#606060';
            element.style.color = 'white';
            element.style.fontWeight = 'bold';
            element.style.position = 'absolute';
            element.style.left = '50%';
            element.style.bottom = '100px';
            element.style.transform = 'translateX(-50%)';
            element.style.display = 'flex';
            element.style.flexDirection = 'column';
            element.style.alignItems = "center";
            element.style.width = "500px";
            element.style.height = "100px";

            element.className = 'ol-unselectable ol-control';
            element.appendChild(date);
            element.appendChild(ts);
            element.appendChild(rangeContainer);
            element.appendChild(container);

            super({
                element: element,
            });

            playStopBtn.addEventListener('click', this.handlePlayStopBtn.bind(this), false);
            refresh.addEventListener('click', this.refreshBtn.bind(this), false);
        }

        myTimer() {
            let slider = document.getElementById("timeSlider")
            let tmp = parseInt(slider.value) + 60;
            if (tmp <= slider.max) {
                slider.value = tmp
                let ts = document.getElementById("tsText")
                ts.innerHTML = new Date(tmp * 1000).toLocaleTimeString();
                let date = document.getElementById("dateText")
                date.innerHTML = new Date(tmp * 1000).toLocaleDateString();
            }
        }

        handlePlayStopBtn() {
            let playStopBtn = document.getElementById("playStopBtn")
            if(play){
                play = false
                playStopBtn.innerHTML = "P"
                console.log("STOP")
            } else {
                play = true
                playStopBtn.innerHTML = "S"
                map2.render()
                console.log("PLAY")
            }
        }

        refreshBtn() {
            window.location.reload();
        }
    }

    var startTime = performance.now()

    if (!isLoaded) {
        console.log("Loading ...")
        return <div ref={mapElement} className="map-container" style={{width: "100%", height: "1050px"}}></div>;
    } else {
        console.log("Ready")
        let vectorSource = new VectorSource();
        console.log(items.length)

        map.on("loadend", function (evt){
            var mid = performance.now()
            console.log(`Load end  ${mid - startTime} milliseconds`)
        })

        for (var i = 0; i < 1000 /* items.length*/ ; i++) {
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
        let cpt = 0
        let nbTotTs = tsMax - tsMin
        currentTs = tsMin;
        let currentCoord = 0;
        let coordinates = [];
        var renderStartTime = performance.now()
        let cpt2 = 0

        vectorLayer.on('postrender', function (event) {
            cpt2++
            const vectorContext = getVectorContext(event);
            features = vectorSource.getFeatures();
            if (currentTs < tsMax) {
                if (play) {
                    coordinates = [];

                    currentTs = currentTs + 60;
                    features.forEach((feature) => {
                        feature.set("currentCoord", 0)
                        currentCoord = 0
                        let tsTmp = feature.get("timestamp")[currentCoord]
                        let currentTmp = null
                        while (currentTs > tsTmp) {
                            currentCoord = currentCoord + 1;
                            tsTmp = feature.get("timestamp")[currentCoord]
                        }
                        currentTmp = feature.getGeometry().getCoordinates()[currentCoord]
                        if (!(typeof currentTmp === 'undefined')) {
                            feature.set("currentCoord", currentCoord)
                            coordinates.push(currentTmp)
                        }
                    });
                    vectorContext.setStyle(ptStyle);
                    vectorContext.drawGeometry(new MultiPoint(coordinates));

                    if (j - 120 < nbTotTs) {
                        j = j + 60
                        map2.render()
                        let slider = document.getElementById("timeSlider")
                        slider.value = currentTs
                        let ts = document.getElementById("tsText")
                        ts.innerHTML = new Date(currentTs * 1000).toLocaleTimeString()
                        let date = document.getElementById("dateText")
                        date.innerHTML = new Date(currentTs * 1000).toLocaleDateString()
                    }
                } else {
                    coordinates = [];

                    features.forEach((feature) => {
                        feature.set("currentCoord", 0)
                        currentCoord = 0
                        let tsTmp = feature.get("timestamp")[currentCoord]
                        let currentTmp = feature.getGeometry().getCoordinates()[currentCoord]
                        while (currentTs > tsTmp) {
                            currentCoord = currentCoord + 1;
                            tsTmp = feature.get("timestamp")[currentCoord]
                        }
                        currentTmp = feature.getGeometry().getCoordinates()[currentCoord]
                        if (!(typeof currentTmp === 'undefined')) {
                            feature.set("currentCoord", currentCoord)
                            coordinates.push(currentTmp)
                        }
                    });

                    vectorContext.setStyle(ptStyle);
                    vectorContext.drawGeometry(new MultiPoint(coordinates));
                }
                cpt = cpt + 1

            } else {
                console.log(cpt2)
                var renderEndTime = performance.now()
                console.log(`Render time : ${renderEndTime - renderStartTime} milliseconds.`)
            }
        });

        return (
            <div ref={mapElement} className="map-container" style={{width: "100%", height: "1050px"}}/>
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