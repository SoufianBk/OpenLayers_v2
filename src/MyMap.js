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

class PublicMap extends Component {
    constructor(props) {
        super(props);
        this.state = {center: [12, 55], zoom: 6, tmp: 0};

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

        this.getData();
        this.map.render();
    }


    getData() {
        var file = 'https://raw.githubusercontent.com/SoufianBk/MobilityDB-OL/main/trips.json';

        var SRC_bigJSON = new Vector({
            url: file,  // big JSON file
            format: new GeoJSON()
        });

        var bigJSON = new VectorLayer({
            source: SRC_bigJSON,
            style: new Style({
                stroke: new Stroke({
                    color: 'rgba(255, 255, 255, 0)'
                })
            })
        });
        this.map.addLayer(bigJSON);

        const ptStyle = new Style({
            image: new Circle({
                radius: 3,
                fill: new Fill({color: 'yellow'}),
                stroke: new Stroke({color: 'red', width: 1}),
            }),
        });

        this.bigJSONPostRender(bigJSON, ptStyle, SRC_bigJSON)
    }

    bigJSONPostRender(bigJSON, ptStyle, SRC_bigJSON) {
        var features
        var tmp = 0
        var map2 = this.map
        bigJSON.on('postrender', function (event) {
            const vectorContext = getVectorContext(event);
            tmp = tmp + 1

            features = SRC_bigJSON.getFeatures();
            var first = features[1200]

            var coordinates = []

            features.forEach((feature) => {
                if (feature.getGeometry().getCoordinates().length > tmp) {
                    coordinates.push(feature.getGeometry().getCoordinates()[tmp])
                }
            });

            console.info(first.getGeometry().getCoordinates().length)

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

    userAction() {
        this.setState({center: [546000, 6868000], zoom: 5});
    }

    render() {
        this.state = { geographic: true };
        return (
            <div id="map" style={{width: "100%", height: "1050px"}}></div>
        );
    }
}

export default PublicMap;
