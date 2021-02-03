import 'ol/ol.css';
import {Map, View, Feature, Overlay} from 'ol';
import OSM from 'ol/source/OSM';
import {fromLonLat} from "ol/proj";
import * as layer from "ol/layer";
import * as source from "ol/source";
import * as geom from "ol/geom";
import * as style from "ol/style";
import $ from "jquery";

var oldLocationStyle = new style.Style({
    image: new style.Circle({
        radius: 5,
        fill: new style.Fill({
            color: 'red'
        })
    }),
});
var newLocationStyle = new style.Style({
    image: new style.Circle({
        radius: 5,
        fill: new style.Fill({
            color: 'green'
        })
    }),
});

var listCoordinate = [
    [110.596, -7.97222],
    [110.59932, -7.96037],
    [110.577, -7.98878],
    [110.61349, -7.9623],
    [110.60029, -7.97887],
    [110.59688, -7.96876],
    [110.61859, -7.98319],
    [110.61855, -7.96428],
    [110.60538, -7.94206],
    [110.5900417, -7.96323056],
    [110.602222, -7.9235 - 8.01775],
    [110.58688, -7.9832],
    [110.6195, -7.92158],
    [110.60355, -7.97289],
    [110.5853, -7.99419],
    [110.59263, -7.98261],
    [110.6189, -7.96563],
    [110.612278, -8.01869],
    [110.58797, -7.9735],
    [110.60997, -7.969722],
    [110.596793, -7.966944],
    [110.604694, -7.96386],
    [110.563, -7.96005],
    [110.60281, -7.9581],
    [110.58766, -8.01782],
    [110.593611, -7.993611],
    [110.59187, -7.96883],
    [110.5969, -7.9822389],
    [110.583921, -7.975673],
    [110.599903, -7.967994],
    [110.5957097, -7.9643411111],
]

var convertedList = listCoordinate.map(function (value, index, array) {
    return new Feature({
        geometry: new geom.Point(fromLonLat(value))
    });
});


const map = new Map({
    target: 'map',
    layers: [
        new layer.Tile({
            source: new OSM()
        }),
        new layer.Vector({
            source: new source.Vector({
                features: convertedList
            }),
            style: oldLocationStyle
        }),
    ],
    view: new View({
        center: fromLonLat([110.596, -7.97222]),
        maxZoom: 18,
        zoom: 12
    })
});

// var container = document.getElementById('popup');
// var content = document.getElementById('popup-content');
// var closer = document.getElementById('popup-closer');

// var overlay = new Overlay({
//     element: container,
//     autoPan: true,
//     autoPanAnimation: {
//         duration: 250
//     }
// });
// map.addOverlay(overlay);
//
// closer.onclick = function () {
//     overlay.setPosition(undefined);
//     closer.blur();
//     return false;
// };
//
// map.on('singleclick', function (event) {
//     if (map.hasFeatureAtPixel(event.pixel) === true) {
//         console.log(event)
//         var coordinate = event.coordinate;
//         content.innerHTML = '<b>Hello world!</b><br />I am a popup. ' + coordinate;
//         overlay.setPosition(coordinate);
//     } else {
//         overlay.setPosition(undefined);
//         closer.blur();
//     }
// });
//
listCoordinate.forEach(function (value, index, array) {
    var container = $(`<div>${index}</div>`);
    $('#map').after(container);
    var overlay = new Overlay({
        element: container.get(0),
        autoPan: true,
        autoPanAnimation: {
            duration: 250
        }
    });
    map.addOverlay(overlay);
    overlay.setPosition(fromLonLat(value));
});

