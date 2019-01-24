//もし誰かが引き継ぐならmapboxのアカウント自分で取ってAPIキー自分の物に差し替えて
const bingApiKey='AszwABNoPgkdx0WBY9mWxqQrA0KVt31moIe2OxNubCdN7ApfhKfDhXQ50mc34Nn4';
const mapboxApiKey= 'pk.eyJ1Ijoic2FuZGNsb2NrIiwiYSI6ImNqbnZkdHdtdDBsemMzcW14cWhoaXJhZWkifQ.QgCrVouZ9aTkeTU3De9UrQ';

let selection = {};//削除する地図情報を格納する
let marker=[];//マーカー情報を保持
let braille=[];//点字情報を保持
let direction=[];//北の矢印マーカーを保持

let editMode="none";

let osmBackLayer = new ol.layer.Tile({
	source: new ol.source.OSM(),
	opacity:0.5,
	}
);

let bingBackLayer = new ol.layer.Tile({
	source: new ol.source.BingMaps({
		key: bingApiKey,
		imagerySet: "Road",
		crossOrigin:"anonymous",
	}),
	opacity:0.5,
	}
);

let mapboxBackLayer = new ol.layer.Tile({
	source: new ol.source.XYZ({
		url: 'https://api.mapbox.com/styles/v1/mapbox/streets-v10/tiles/256/{z}/{x}/{y}?access_token='+mapboxApiKey,
		crossOrigin:"anonymous",
	}),
	opacity:0.5,
	}
);

let satelliteBackLayer = new ol.layer.Tile({
	source: new ol.source.XYZ({
		url: 'https://api.mapbox.com/styles/v1/mapbox/satellite-streets-v9/tiles/256/{z}/{x}/{y}?access_token='+mapboxApiKey,
		crossOrigin:"anonymous",
	}),
	opacity:0.5,
	}
);

let gsiBackLayer = new ol.layer.Tile({
	source: new ol.source.XYZ({
		url: "http://cyberjapandata.gsi.go.jp/xyz/std/{z}/{x}/{y}.png",
		attributions: "<a href='http://maps.gsi.go.jp/development/ichiran.html' target='_blank'>地理院タイル</a>",
		crossOrigin:"anonymous",
	}),
	opacity:0.5,
	}
);




let mapboxRoadLayer = new ol.layer.VectorTile({
	source: new ol.source.VectorTile({
		attributions: '© <a href="https://www.mapbox.com/map-feedback/">Mapbox</a> ' +
		'© <a href="https://www.openstreetmap.org/copyright">' +
		'OpenStreetMap contributors</a>',
		format: new ol.format.MVT({layers:"road"}),
		tileGrid: new ol.tilegrid.createXYZ({/*minZoom: 11, maxZoom: 22*/}),
		url: 'https://{a-d}.tiles.mapbox.com/v4/mapbox.mapbox-streets-v7/{z}/{x}/{y}.vector.pbf?access_token=' + mapboxApiKey,
	}),
	renderMode:"image",
	style:function(feature,resolution){
		let style;
		let selected = !!selection[feature.id_];//表示する道路を単体で消す機能追加したかったけど無理っぽい
		if($(".layerconfig").prop('checked')){
			style= mapboxSelectRoadStyle(feature.properties_);
		}else{
			style= mapboxAutoRoadStyle(feature.properties_);
		}
		return[new ol.style.Style({
			stroke: new ol.style.Stroke({
				color: selected?[0, 0, 0, 0]:style.color,
				width: style.width,
				lineCap: "square",
			}),
		})];
	}
});

let mapboxRailLayer = new ol.layer.VectorTile({
	source: new ol.source.VectorTile({
		attributions: '© <a href="https://www.mapbox.com/map-feedback/">Mapbox</a> ' +
		'© <a href="https://www.openstreetmap.org/copyright">' +
		'OpenStreetMap contributors</a>',
		format: new ol.format.MVT({layers:"road"}),
		tileGrid: new ol.tilegrid.createXYZ({/*minZoom: 11, maxZoom: 22*/}),
		url: 'https://{a-d}.tiles.mapbox.com/v4/mapbox.mapbox-streets-v7/{z}/{x}/{y}.vector.pbf?access_token=' + mapboxApiKey,
	}),
	renderMode:"image",
	style:function(feature,resolution){
		let color=[0, 0, 0, 0];
		let width=0;
		if(["major_rail","minor_rail"].indexOf(feature.get("class"))>=0&&map.getView().getZoom()>=16){
			color="black";
			width=5;
		}
		let selected = !!selection[feature.id_];
		return[new ol.style.Style({
			stroke: new ol.style.Stroke({
				color: selected?[0, 0, 0, 0]:color,
				width: width,
				lineCap: "square",
				lineDash:[10,20],
			})
		})];
	}
});


let mapboxRiverLayer = new ol.layer.VectorTile({
	source: new ol.source.VectorTile({
		attributions: '© <a href="https://www.mapbox.com/map-feedback/">Mapbox</a> ' +
		'© <a href="https://www.openstreetmap.org/copyright">' +
		'OpenStreetMap contributors</a>',
		tileGrid: new ol.tilegrid.createXYZ({/*minZoom: 11, maxZoom: 22*/}),
		format: new ol.format.MVT({layers:"waterway"}),
		url: 'https://{a-d}.tiles.mapbox.com/v4/mapbox.mapbox-streets-v7/{z}/{x}/{y}.vector.pbf?access_token=' + mapboxApiKey,
	}),
	renderMode:"image",
	style:function(feature,resolution){
		let color=[0, 0, 0, 0];
		let width=0;
		if(map.getView().getZoom()>=16&&feature.properties_.layer==="water"){
			color="black";
			width=5;
		}
		let selected = !!selection[feature.id_];
		return[new ol.style.Style({
			stroke: new ol.style.Stroke({
				color: selected?[0, 0, 0, 0]:color,
				width: width,
				lineCap: "round",
				lineDash:[10,20,0,20],
			}),
			// fill: new ol.style.Fill({
			// 	color:"blue",
			// })
		})];
	}
});


let mapboxBuildingLayer = new ol.layer.VectorTile({
	source: new ol.source.VectorTile({
		attributions: '© <a href="https://www.mapbox.com/map-feedback/">Mapbox</a> ' +
		'© <a href="https://www.openstreetmap.org/copyright">' +
		'OpenStreetMap contributors</a>',
		format: new ol.format.MVT({layers:"building"}),
		tileGrid: new ol.tilegrid.createXYZ({/*minZoom: 11, maxZoom: 22*/}),
		url: 'https://{a-d}.tiles.mapbox.com/v4/mapbox.mapbox-streets-v7/{z}/{x}/{y}.vector.pbf?access_token=' + mapboxApiKey,
	}),
	renderMode:"image",
	style:function(feature,resolution){
		let color="black";
		let width=5;
		let selected = !!selection[feature.id_];
		return[new ol.style.Style({
			stroke: new ol.style.Stroke({
				color: selected?[0, 0, 0, 0]:color,
				width: width,
				lineCap: "square",
				// lineDash:[10,20],
			})
		})];
	}
});

let mapboxCoastlineLayer = new ol.layer.VectorTile({
	source: new ol.source.VectorTile({
		attributions: '© <a href="https://www.mapbox.com/map-feedback/">Mapbox</a> ' +
		'© <a href="https://www.openstreetmap.org/copyright">' +
		'OpenStreetMap contributors</a>',
		tileGrid: new ol.tilegrid.createXYZ({/*minZoom: 11, maxZoom: 22*/}),
		format: new ol.format.MVT({layers:"waterarea"}),
		url: 'https://{a-d}.tiles.mapbox.com/v4/mapbox.mapbox-streets-v7/{z}/{x}/{y}.vector.pbf?access_token=' + mapboxApiKey,
	}),
	renderMode:"image",
	style:function(feature,resolution){
		let color=[0, 0, 0, 0];
		let width=0;
		color="black";
		width=5;
		var selected = !!selection[feature.id_];
		return[new ol.style.Style({
			stroke: new ol.style.Stroke({
				color: selected?[0, 0, 0, 0]:color,
				width: width,
				lineCap: "square",
			})
		})];
	}
});

let mapboxAdminLayer = new ol.layer.VectorTile({
	source: new ol.source.VectorTile({
		attributions: '© <a href="https://www.mapbox.com/map-feedback/">Mapbox</a> ' +
		'© <a href="https://www.openstreetmap.org/copyright">' +
		'OpenStreetMap contributors</a>',
		tileGrid: new ol.tilegrid.createXYZ({/*minZoom: 11, maxZoom: 22*/}),
		format: new ol.format.MVT({layers:"admin"}),
		url: 'https://{a-d}.tiles.mapbox.com/v4/mapbox.mapbox-streets-v7/{z}/{x}/{y}.vector.pbf?access_token=' + mapboxApiKey,
	}),
	renderMode:"image",
	style:function(feature,resolution){
		let color=[0, 0, 0, 0];
		let width=0;
		// if(map.getView().getZoom()>=16&&feature.properties_.layer==="waterway"){
			color="black";
			width=5;
		// }
		var selected = !!selection[feature.id_];
		return[new ol.style.Style({
			stroke: new ol.style.Stroke({
				color: selected?[0, 0, 0, 0]:color,
				width: width,
				lineCap: "square",
			})
		})];
	}
});

//編集:線
let lineSource = new ol.source.Vector();
let lineLayer = new ol.layer.Vector({
	source: lineSource,
	style: new ol.style.Style({
		stroke: new ol.style.Stroke({
			color: 'black',
			width: 5
		}),
	})
});
let draw = new ol.interaction.Draw({
	source: lineSource,
	type: "LineString",
	geometryName:"drawLine",
});

//編集:マーカー
let markerStyle = [
	new ol.style.Style({
			image: new ol.style.Circle({
				fill: new ol.style.Fill({
					color: "white",
				}),
				stroke: new ol.style.Stroke({
					color: "black",
					width: 6,
				}),
				radius:20,
			})
	}),
	new ol.style.Style({
			image: new ol.style.Circle({
				fill: new ol.style.Fill({
					color: "black",
				}),
				stroke: new ol.style.Stroke({
					color: "black",
					width: 1,
				}),
				radius:10,
			}),
	}),
];
let markerLayer = new ol.layer.Vector();

//編集:点字
let brailleLayer = new ol.layer.Vector();

//編集:方向
let directionLayer = new ol.layer.Vector();
let directionStyle = new ol.style.Style({
	stroke: new ol.style.Stroke({
		color: 'black',
		width: 5
	}),
});
