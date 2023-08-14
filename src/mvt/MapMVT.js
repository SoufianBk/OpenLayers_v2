import React, { useEffect, useRef, useState} from "react";
import Map from "ol/Map";
import View from "ol/View";
import MVT from "ol/format/MVT";
import TileLayer from "ol/layer/Tile";
import SourceOSM from "ol/source/OSM";
import VectorTileLayer from "ol/layer/VectorTile";
import VectorTileSource from 'ol/source/VectorTile';
import {Fill, Circle, Stroke, Style} from 'ol/style.js';
import {getVectorContext} from "ol/render";
import MultiPoint from "ol/geom/MultiPoint";
import Feature from "ol/Feature";
import {LineString} from "ol/geom";
import VectorSource from "ol/source/Vector";
import VectorLayer from "ol/layer/Vector";
import {TileDebug} from "ol/source";
import {unByKey} from "ol/Observable";
import * as proj from "ol/proj";
import {createXYZ} from "ol/tilegrid";
import {Control} from "ol/control";

var usePgtileserv = false;

function MapMVT() {
    const [map, setMap] = useState([]);
    const [isLoaded, setIsLoaded] = useState(false);
    const [timestamps, setTimestamps] = useState([]);

    const mapRef = useRef()
    mapRef.current = map

    const lineStyle = new Style({
        stroke: new Stroke({
            color: '#00608F',
            width: 2,
        }),
    })

    const ptStyle = new Style({
        fill: new Fill({
            color: 'rgba(255, 255, 255, 0.2)'
        }),
        stroke: new Stroke({
            color: 'rgba(255, 255, 255, 0)',
            width: 2
        }),
        image: new Circle({
            radius: 3,
            fill: new Fill({color: 'yellow'}),
            stroke: new Stroke({color: 'red', width: 1}),
        }),
    });

    useEffect(() => {
        fetch("http://localhost:3001/json/ts")
            .then(res => res.json())
            .then(
                (result) => {
                    setTimestamps(result);
                    setIsLoaded(true);
                }
            )
    }, [])

    useEffect(() => {
        // create map
        const initialMap = new Map({
            target: 'map',
            layers: [
                new TileLayer({
                    source: new SourceOSM()
                })
            ],
            view: new View({
                center: [12, 55],
                // center: [-73.949997, 40.650002],
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
            element.style.height = "70px";

            element.className = 'ol-unselectable ol-control';
            element.appendChild(date);
            element.appendChild(ts);
            element.appendChild(container);

            super({
                element: element,
            });

            playStopBtn.addEventListener('click', this.handlePlayStopBtn.bind(this), false);
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
    }

    if (!isLoaded) {
        console.log("Loading ...")
        return <div id="map" className="map" style={{width: "100%", height: "1050px"}}></div>
    } else {
        var startTime = performance.now()
        console.log("Ready")

        var tileGrid = createXYZ({
            extent: proj.get('EPSG:3857').getExtent(),
            tileSize: 256,
            maxZoom: 22,
            minZoom: 0
        });


        if(usePgtileserv){
            var vectorTileSource = new VectorTileSource({
                format: new MVT({
                    featureClass: Feature,
                }),
                tileGrid: tileGrid,
                url: 'http://localhost:7800/public.tripsfct/{z}/{x}/{y}.pbf'
            })
        } else {
            var vectorTileSource = new VectorTileSource({
                format: new MVT({
                    featureClass: Feature,
                }),
                tileGrid: createXYZ({ maxZoom: 18 }),
                tileUrlFunction: function (tileCoord) {
                    const z = tileCoord[0];
                    const x = tileCoord[1];
                    const y = tileCoord[2];

                    const url = `http://localhost:3001/tiles/${z}/${x}/${y}`;
                    return url;
                },
            });
        }

        const vectorTileLayer = new VectorTileLayer({
            source: vectorTileSource,
            style: null
        });

        let vectorSource = new VectorSource();

        const vectorLayer = new VectorLayer({
            source: vectorSource,
            style: ptStyle
        });

        let tileDebug = new TileLayer({
            source: new TileDebug(),
        })

        map.addLayer(vectorTileLayer)
        // map.addLayer(tileDebug);
        map.addLayer(vectorLayer);
        let map2 = map
        let count = 0;

        var newEndTime = null
        var firstTile = null
        var firstTileInstant = null

        var listenerKey = vectorTileSource.on('tileloadend', function (evt) {
            count++
            var oldEndTime = newEndTime
            newEndTime = performance.now()
            // console.log(`Tile number ${count} took ${newEndTime - startTime} milliseconds ${newEndTime - oldEndTime}`)

            if(count == 1 ){
                firstTile = newEndTime - startTime
                firstTileInstant = newEndTime
            }

            let features = evt.tile.getFeatures();
            features.forEach((feature) => {
                if (!(typeof feature === "undefined")) {
                    if (feature.getGeometry() !== null) {
                        let featureType = feature.getGeometry().getType()
                        let mmsi = feature.getProperties().id
                        // let mmsi = feature.getProperties().tripid
                        let t = feature.getProperties().times
                        t = t.replace(/\"/g, "");
                        t = t.slice(1, -1)
                        t = t.split(",")
                        // t = t.map(toTimestamp)

                        let line

                        if (featureType === "MultiLineString"){
                            let tmpCoords = [].concat.apply([], feature.getGeometry().getCoordinates());
                            line =  new LineString(tmpCoords)
                        } else{
                            line = new LineString(feature.getGeometry().getCoordinates())
                        }
                        line.transform('EPSG:3857', 'EPSG:4326');

                        const geoMarker = new Feature({
                            geometry: new LineString(line.getCoordinates()),
                        });

                        geoMarker.set('mmsi', mmsi)
                        geoMarker.set('t', t)

                        let vsFeatures = vectorSource.getFeatures()
                        let isAlreadyIn = false
                        vsFeatures.forEach((vFeature) => {
                            isAlreadyIn = vFeature.get('mmsi') === mmsi || isAlreadyIn
                            if (vFeature.get('mmsi') === mmsi) {
                                let vCoords = vFeature.getGeometry().getCoordinates()
                                vFeature.getGeometry().setCoordinates(vCoords.concat(line.getCoordinates()))

                                let vTs = vFeature.get("t")
                                vTs.concat(t)
                                vFeature.set("t", vTs)
                            }
                        });
                        if (!isAlreadyIn) {
                            geoMarker.set("currentCoord", 0)
                            vectorSource.addFeature(geoMarker)
                        }
                    }
                }
            });
        });

        map.on("loadend", function (evt){
            var mapLoaded = performance.now()
            console.log(`Map Loaded in ${mapLoaded - startTime} milliseconds. Since 1st Tile ${mapLoaded - firstTileInstant} ms`)
            console.log("First tile loading time " + firstTile)
        })

        let tsMin = toTimestamp(timestamps[0].min)
        let tsMax = toTimestamp(timestamps[0].max)
        // console.log(tsMin)
        // console.log(tsMax)

        map.addControl(new Slider(tsMin, tsMax))

        let nbTotTs = tsMax - tsMin
        currentTs = tsMin;
        let currentCoord = 0;
        let j = 0
        let coordinates = [];
        var renderStartTime = performance.now()
        let cpt2 = 0

        vectorLayer.on('postrender', function (event) {
            cpt2++
            const vectorContext = getVectorContext(event);
            let features = vectorSource.getFeatures();
            if (currentTs < tsMax) {
                if (count === 30 || count === 40) {
                    unByKey(listenerKey)
                    if (play) {
                        coordinates = [];
                        currentTs = currentTs + 60;
                        features.forEach((feature) => {
                            feature.set("currentCoord", 0)
                            currentCoord = 0
                            let tsTmp = feature.get("t")[currentCoord]
                            let currentTmp = null
                            while (currentTs > tsTmp) {
                                currentCoord = currentCoord + 1;
                                tsTmp = feature.get("t")[currentCoord]
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
                            let tsTmp = feature.get("t")[currentCoord]
                            let currentTmp = feature.getGeometry().getCoordinates()[currentCoord]
                            while (currentTs > tsTmp) {
                                currentCoord = currentCoord + 1;
                                tsTmp = feature.get("t")[currentCoord]
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
                } else if(count == 29 || count == 39){
                    // var endTime = performance.now()
                    // console.log(`Tile Loading took ${endTime - startTime} milliseconds`)
                }
            } else {
                // console.log(cpt2)
                var renderEndTime = performance.now()
                // console.log(`Render time : ${renderEndTime - renderStartTime} milliseconds.`)
            }
        });

        return <div id="map" className="map" style={{width: "100%", height: "1050px"}}></div>;
    }
}

const toTimestamp = (strDate) => {
    const dt = Date.parse(strDate);
    return dt / 1000;
}


export default MapMVT;


// url: 'https://api.mapbox.com/v4/mapbox.mapbox-streets-v8/{z}/{x}/{y}.mvt?access_token=pk.eyJ1Ijoid2F6eXN0YXRzIiwiYSI6ImNsZTVoc3E1ZTA5c3QzdnM0dGczbnl2NXgifQ.RdsCypYt4CqvhpIuhjaX4Q'
// url: 'https://raw.githubusercontent.com/SoufianBk/OpenLayers_v2/master/src/PostGIS-trips.mvt'
