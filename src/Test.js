import React, {Component, useState} from "react";
import Map from "ol/Map";
import View from "ol/View";
import LayerTile from "ol/layer/Tile";
import SourceOSM from "ol/source/OSM";
import Vector from "ol/source/Vector";
import VectorLayer from "ol/layer/Vector";
import GeoJSON from "ol/format/GeoJSON"
import Style from "ol/style/Style"
import Stroke from "ol/style/Stroke"
import Circle from "ol/style/Circle"
import Fill from "ol/style/Fill"
import MultiPoint from "ol/geom/MultiPoint"
import {getVectorContext} from 'ol/render';
import {useGeographic} from "ol/proj";
import VectorSource from "ol/source/Vector";

class Test extends Component {
    constructor(props) {
        super(props);
        this.state = {center: [12, 55], zoom: 6, items: [], isLoaded: false, tmp: 0};

        this.map = new Map({
            target: null,
            layers: [
                new LayerTile({
                    source: new SourceOSM()
                })
            ],
            view: new View({
                center: this.state.center,
                zoom: this.state.zoom
            })
        });

        this.map.render();
    }


    getData() {
        console.log("Ready")
        let trip0 = eval('('+ this.state.items[0].asmfjson + ')');
        trip0.type = "LineString"

        let vectorSource = new VectorSource({
            features: new GeoJSON().readFeatures(trip0),  // big JSON file
        });
        console.log(trip0)

        for (var i = 1; i < 100; i++) {
            let trip = eval('('+ this.state.items[i].asmfjson + ')');
            trip.type = "LineString"
            vectorSource.addFeature(new GeoJSON().readFeature(trip))
            console.log(trip)
        }


        let vectorLayer = new VectorLayer({
            source: vectorSource,
            style: new Style({
                stroke: new Stroke({
                    color: 'rgba(255, 255, 255, 0)'
                })
            })
        });

        this.map.addLayer(vectorLayer);

        const ptStyle = new Style({
            image: new Circle({
                radius: 3,
                fill: new Fill({color: 'yellow'}),
                stroke: new Stroke({color: 'red', width: 1}),
            }),
        });

        let features
        let tmp = 0
        let map2 = this.map
        vectorLayer.on('postrender', function (event) {
            const vectorContext = getVectorContext(event);
            tmp = tmp + 1

            features = vectorSource.getFeatures();
            console.log(features.length)
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
            }
        });

    }

    updateMap() {
        this.map.getView().setCenter(this.state.center);
        this.map.getView().setZoom(this.state.zoom);
    }

    componentDidMount() {
        fetch("http://localhost:3001")
            .then(res => res.json())
            .then(
                (result) => {
                    this.state.isLoaded = true;
                    this.state.items = result;
                }
            )

        this.map.setTarget("map");

        // Listen to map changes
        this.map.on("moveend", () => {
            let center = this.map.getView().getCenter();
            let zoom = this.map.getView().getZoom();
            this.setState({center, zoom});
        });

    }

    shouldComponentUpdate(nextProps, nextState) {
        let center = this.map.getView().getCenter();
        let zoom = this.map.getView().getZoom();
        if (center === nextState.center && zoom === nextState.zoom) return false;
        return true;
    }

    render() {
        if (!this.state.isLoaded) {
            console.log("Loading ...")
            return (<div id="map" style={{width: "100%", height: "1050px"}}></div>);
        } else {
            console.log("Ready")
            this.getData();
            return (<div id="map" style={{width: "100%", height: "1050px"}}></div>);
        }
    }
}

export default Test;
