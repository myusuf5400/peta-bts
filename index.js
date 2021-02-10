import 'ol/ol.css';
import {Map, View, Feature, Overlay} from 'ol';
import OSM from 'ol/source/OSM';
import {fromLonLat, toLonLat} from "ol/proj";
import * as layer from "ol/layer";
import * as source from "ol/source";
import * as geom from "ol/geom";
import * as style from "ol/style";
import firebase from "firebase/app";
import "firebase/firestore";
import data_menara from "./data_menara.json";
import Geolocation from 'ol/Geolocation';

var selectKecamatan = document.getElementById("selectKecamatan");

var opt = document.createElement('option');
opt.appendChild(document.createTextNode('Semua'));
opt.value = 'all'
selectKecamatan.appendChild(opt)

for (const [key, value] of Object.entries(data_menara)) {
    var opt = document.createElement('option');
    opt.appendChild(document.createTextNode(key));
    opt.value = key
    selectKecamatan.appendChild(opt)
}


var newLocationStyle = new style.Style({
    image: new style.Circle({
        radius: 10,
        fill: new style.Fill({
            color: 'green'
        })
    }),
});


// data_menara.forEach(function (value, index) {
//     console.log(value)
//     convertedList.push(new Feature({
//         geometry: new geom.Point(fromLonLat([value['long'], value['lat']]))
//     }));
// });

var view = new View({
    center: fromLonLat([110.6169, -8.0305]),
    zoom: 12,
});

const map = new Map({
    renderer: 'webgl',
    target: 'map',
    layers: [
        new layer.Tile({
            source: new OSM()
        }),
    ],
    view: view
});


var vectorBts = new layer.Vector({
    source: new source.Vector({
        features: []
    }),
    style: function (feature, resolution) {
        return new style.Style({
            image: new style.Circle({
                radius: 6,
                fill: new style.Fill({
                    color: 'red'
                })
            }),
            text: new style.Text({
                scale: 1.2,
                offsetY: 20,
                text: feature.get('label'),
                fill: new style.Fill({
                    color: "green"
                }),
                stroke: new style.Stroke({
                    color: "#ffffff",
                    width: 3
                }),
            })
        });
    }
})
map.addLayer(vectorBts);

var geolocation = new Geolocation({
    // enableHighAccuracy must be set to true to have the heading value.
    trackingOptions: {
        enableHighAccuracy: true,
    },
    projection: view.getProjection(),
});

var positionFeature = new Feature();
positionFeature.setStyle(
    new style.Style({
        image: new style.Circle({
            radius: 6,
            fill: new style.Fill({
                color: '#3399CC',
            }),
            stroke: new style.Stroke({
                color: '#fff',
                width: 2,
            }),
        }),
    })
);

vectorBts.getSource().addFeature(positionFeature)

// var inputCoordinate = document.getElementById("inputCoordinate");
var inputLat = document.getElementById("inputLat");
var inputLong = document.getElementById("inputLong");
var inputAccuracy = document.getElementById("inputAccuracy");
var btnTrackMe = document.getElementById("trackMe");
var isTracked = false;

btnTrackMe.addEventListener("click", function () {
    geolocation.setTracking(true);
    isTracked = false;
});

geolocation.on('change:accuracy', function () {
    inputAccuracy.value = parseFloat(geolocation.getAccuracy()).toFixed(1) + ' m';
})
geolocation.on('change:position', function () {
    var coordinates = geolocation.getPosition();
    var [long, lat] = toLonLat(coordinates)
    // inputCoordinate.value = lat + ", " + long
    inputLong.value = parseFloat(long).toFixed(7)
    inputLat.value = parseFloat(lat).toFixed(7)
    positionFeature.setGeometry(coordinates ? new geom.Point(coordinates) : null);
    if (!isTracked) {
        view.setZoom(16);
        view.setCenter(coordinates);
        isTracked = true;
    }
});

geolocation.on('error', function (error) {
    alert(error.message);
});

var histories = [];

function drawMarker(choice, listBts) {
    if (!histories.includes(choice)) {
        var convertedList = [];
        var tmpHistories = [];
        listBts.forEach(function (value, index) {
            if (!value['long'] || !value['lat'] || histories.includes(value['kecamatan'])) {
                console.log(value['kecamatan'])
                return
            }
            convertedList.push(new Feature({
                geometry: new geom.Point(fromLonLat([value['long'], value['lat']])),
                label: `No. ${value['num']}\n(${value['kecamatan']})`,
                num: value['num'],
                kecamatan: value['kecamatan'],
                tinggi: value['tinggi'],
                struktur: value['struktur'],
                lat: value['lat'],
                long: value['long'],
            }));

            if (!tmpHistories.includes(value['kecamatan'])) {
                tmpHistories.push(value['kecamatan'])
            }
        });

        convertedList.forEach(function (value) {
            vectorBts.getSource().addFeature(value)
        });

        tmpHistories.forEach(function (value) {
            if (!histories.includes(value)) {
                histories.push(value);
            }
        });

        if (!histories.includes(choice)) {
            histories.push(choice);
        }
    }
}

selectKecamatan.addEventListener("change", function () {
    console.log(selectKecamatan.value)
    if (selectKecamatan.value !== "Pilih Kecamatan") {
        if (selectKecamatan.value === 'all') {
            var allList = []
            Object.values(data_menara).forEach(function (listBts) {
                allList.push(...listBts)
            })
            drawMarker(selectKecamatan.value, allList)
        } else {
            drawMarker(selectKecamatan.value, data_menara[selectKecamatan.value])
        }
    }
});

var container = document.getElementById('popup');
var content = document.getElementById('popup-content');
// var closer = document.getElementById('popup-closer');

var overlay = new Overlay({
    element: container,
    autoPan: true,
    autoPanAnimation: {
        duration: 250
    }
});
map.addOverlay(overlay);

// closer.onclick = function () {
//     overlay.setPosition(undefined);
//     closer.blur();
//     return false;
// };

map.on('singleclick', function (event) {
    if (map.hasFeatureAtPixel(event.pixel) === true) {
        var feature = map.getFeaturesAtPixel(event.pixel)[0]
        var coordinate = event.coordinate
        content.innerHTML = `
            <div class="popup">
                No: ${feature.get('num')}<br/>
                Kecamatan: ${feature.get('kecamatan')}<br/>
                Tinggi: ${feature.get('tinggi')}<br/>
                Struktur: ${feature.get('struktur')}<br/>
                <a href="http://www.google.com/maps/place/${feature.get('lat')},${feature.get('long')}">Map</a>
            </div>
        `
        overlay.setPosition(coordinate);
    } else {
        overlay.setPosition(undefined);
    }
});
//

// Object.entries(data_menara).forEach(function (value, index, array) {
//     return value.forEach(function (ivalue, iindex, iarray) {
//         console.log(ivalue)
//         var container = $(`
//         <div class="popup">
//             No: ${iindex}<br/>
//             <a href="http://www.google.com/maps/place/${ivalue['long']},${ivalue['lat']}">Map</a>
//         </div>
//     `);
//         $('#map').after(container);
//         var overlay = new Overlay({
//             element: container.get(0),
//             autoPan: true,
//             autoPanAnimation: {
//                 duration: 250
//             }
//         });
//         map.addOverlay(overlay);
//         overlay.setPosition(fromLonLat([ivalue['long'] + 0.0002, ivalue['lat'] + 0.0002]));
//     });
// });





































