import React, {Component, useEffect, useRef, useState} from "react";
import Map from "ol/Map";
import View from "ol/View";
import MVT from "ol/format/MVT";
import TileLayer from "ol/layer/Tile";
import SourceOSM from "ol/source/OSM";
import VectorTileLayer from "ol/layer/VectorTile";
import VectorTileSource from 'ol/source/VectorTile';
import {Fill, Circle, Stroke, Style, Text, Icon} from 'ol/style.js';
import {getVectorContext} from "ol/render";
import MultiPoint from "ol/geom/MultiPoint";
import Feature from "ol/Feature";
import {LineString, Point} from "ol/geom";
import VectorSource from "ol/source/Vector";
import VectorLayer from "ol/layer/Vector";
import {TileDebug} from "ol/source";
import {unByKey} from "ol/Observable";
import * as proj from "ol/proj";
import {createXYZ} from "ol/tilegrid";

function MapMVT() {
    const [map, setMap] = useState([]);
    const [isLoaded, setIsLoaded] = useState(false);
    const [timestamps, setTimestamps] = useState([]);
    const [buttonText, setButtonText] = useState("Start");

    const mapElement = useRef()
    const mapRef = useRef()
    mapRef.current = map

    const lineStyle = new Style({
        stroke: new Stroke({
            color: '#00308F',
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

    const geoMarker = new Style({
        image: new Circle({
            radius: 7,
            fill: new Fill({color: 'black'}),
            stroke: new Stroke({
                color: 'white',
                width: 2,
            }),
        }),
    });

    useEffect(() => {
        fetch("http://localhost:3001/mvt/ts")
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
                zoom: 6
            }),
            controls: []
        })

        setMap(initialMap)
    }, [])

    if (!isLoaded) {
        console.log("Loading ...")
        return <div id="map" className="map" style={{width: "100%", height: "1050px"}}></div>
    } else {
        console.log("Ready")

        var tileGrid = createXYZ({
            extent: proj.get('EPSG:3857').getExtent(),
            tileSize: 256,
            maxZoom: 22,
            minZoom: 0
        });

        let vectorTileSource = new VectorTileSource({
            format: new MVT({
                featureClass: Feature,
            }),
            tileGrid: tileGrid,
            url: 'http://localhost:7800/public.tripsl/{z}/{x}/{y}.pbf?limit=1'
        })

        const vectorTileLayer = new VectorTileLayer({
            source: vectorTileSource,
            style: lineStyle
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
        map.addLayer(tileDebug);
        map.addLayer(vectorLayer);

        let map2 = map

        let count = 0;


        var listenerKey = vectorTileSource.on('tileloadend', function (evt) {
            // var tileCoord = evt.tile.getTileCoord();
            // console.log('Tile loaded:', tileCoord);
            count++
            console.log(count)

            let features = evt.tile.getFeatures();
            features.forEach((feature) => {
                if (!(typeof feature === "undefined")) {
                    let mmsi = feature.getProperties().mmsi
                    const geometry = feature.getGeometry();
                    if (geometry !== null) {
                        var tmpCoords = []
                        geometry.getCoordinates().forEach((coord) => {
                            if (coord.length == 2) {
                                tmpCoords.push(coord)
                            } else {
                                coord.forEach((subCoord) => {
                                    if (subCoord.length == 2) {
                                        tmpCoords.push(subCoord)
                                    }
                                })
                            }
                        })
                    }
                    let line = new LineString(tmpCoords)
                    line.transform('EPSG:3857', 'EPSG:4326');

                    // console.log(line.getCoordinates())

                    let t = feature.getProperties().t
                    t = t.replace(/\"/g, "");
                    t = t.slice(1, -1)
                    t = t.split(",")

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
                            let coords = vFeature.getGeometry().getCoordinates()
                            vFeature.getGeometry().setCoordinates(coords.concat(line.getCoordinates()))
                        }
                    });
                    if (!isAlreadyIn) {
                        vectorSource.addFeature(geoMarker)
                    }
                }
            });
        });

        let tmp = 0
        let tsMin = toTimestamp(timestamps[0].min)
        let tsMax = toTimestamp(timestamps[0].max)
        let nbTotTs = tsMax - tsMin
        let currentTs = tsMin;
        let currentCoord = 0;

        vectorLayer.on('postrender', function (event) {
            if(currentTs < tsMax) {
                if (count === 30 || count === 40) {
                    unByKey(listenerKey)
                    const vectorContext = getVectorContext(event);
                    let features = vectorSource.getFeatures();
                    // console.log(features[0].getGeometry().getCoordinates())
                    let coordinates = [];
                    features.forEach((feature) => {
                        if (!(typeof feature.getGeometry() === "undefined")) {
                            let currentTmp = feature.getGeometry().getCoordinates()[tmp]
                            if (!(typeof currentTmp === "undefined")) {
                                if (currentTmp.length == 2) {
                                    coordinates.push(currentTmp)
                                    console.log("----------------")
                                    console.log(feature.getGeometry().getCoordinates().length)
                                    console.log(feature.get("t").length)
                                }
                            }
                        }
                    });

                    if (coordinates.length > 0) {
                        vectorContext.setStyle(ptStyle);
                        vectorContext.drawGeometry(new MultiPoint(coordinates));
                    }

                    if (tmp < 502) {
                        map2.render()
                        tmp = tmp + 1
                    }
                }
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
