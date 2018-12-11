//もし誰かが引き継ぐならmapboxのアカウント自分で取ってAPIキー自分の物に差し替えて
const mapboxApiKey= 'pk.eyJ1Ijoic2FuZGNsb2NrIiwiYSI6ImNqbnZkdHdtdDBsemMzcW14cWhoaXJhZWkifQ.QgCrVouZ9aTkeTU3De9UrQ';

let osmBackLayer = new ol.layer.Tile({
	source: new ol.source.OSM(),
	opacity:0.5,
	}
);

let bingBackLayer = new ol.layer.Tile({
	source: new ol.source.BingMaps({
		key: 'AszwABNoPgkdx0WBY9mWxqQrA0KVt31moIe2OxNubCdN7ApfhKfDhXQ50mc34Nn4',
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

let gsiBackLayer = new ol.layer.Tile({
	source: new ol.source.XYZ({
		url: "http://cyberjapandata.gsi.go.jp/xyz/std/{z}/{x}/{y}.png",
		attributions: "<a href='http://maps.gsi.go.jp/development/ichiran.html' target='_blank'>地理院タイル</a>",
		crossOrigin:"anonymous",
	}),
	opacity:0.5,
	}
);


const mapboxRoadContents=["street","track","link","street_limited","service","secondary","trunk","primary","tertiary","motorway"];

function mapboxAutoRoadStyle(feature){
	let color = "#00000000";
	let width = 0;
	let visibility="invisible";
	if(map.getView().getZoom()>=16){
		if(["street","track","link","street_limited","service","path"].indexOf(feature.class)>=0){
			color="black";
			width=5;
			visibility="visible";
			return {color:color,width:width,visibility:visibility};
		}
	}
	if(map.getView().getZoom()>=13){
		if(["secondary","trunk","primary","tertiary"].indexOf(feature.class)>=0){
			color="black";
			width=5;
			visibility="visible";
			return {color:color,width:width,visibility:visibility};
		}
	}
	if(map.getView().getZoom()>=10){
		if(["motorway"].indexOf(feature.class)>=0){
			color="black";
			width=5;
			visibility="visible";
			return {color:color,width:width,visibility:visibility};
		}
	}
	return {color:color,width:width,visibility:visibility};
}

function mapboxSelectRoadStyle(feature){
	let color = "#00000000";
	let width = 0;
	let visibility="invisible";
	let select=$("#layer").val();
	for(value in select){
		if(feature.class==select[value]){
			color="black";
			width=5;
			visibility="visible";
			return {color:color,width:width,visibility:visibility};
		}
	}
	return {color:color,width:width,visibility:visibility};
}
  var selection = {};

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
		// if(feature.properties_=="")
		// console.log(feature.properties_.class+" / "+feature.properties_.type);
		var selected = !!selection[feature.id_];//表示する道路を単体で消す機能追加したかったけど無理っぽい
		if($(".layerconfig").prop('checked')){
			style= mapboxSelectRoadStyle(feature.properties_);
		}else{
			style= mapboxAutoRoadStyle(feature.properties_);
		}
		return[new ol.style.Style({
			stroke: new ol.style.Stroke({
				color: selected?"#00000000":style.color,//selected消すかもしれないから忘れないように
				width: selected?8:style.width,
				lineCap: "square",
			})
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
		let color="#00000000";
		let width=0;
		if(["major_rail","minor_rail"].indexOf(feature.get("class"))>=0){
			color="black";
			width=5;
		}
		var selected = !!selection[feature.id_];
		return[new ol.style.Style({
			stroke: new ol.style.Stroke({
				color: selected?"#00000000":color,
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
		let color="#00000000";
		let width=0;
		if(map.getView().getZoom()>=16&&feature.properties_.layer==="waterway"){
			color="black";
			width=5;
		}
		var selected = !!selection[feature.id_];
		return[new ol.style.Style({
			stroke: new ol.style.Stroke({
				color: selected?"#00000000":color,
				width: width,
				lineCap: "square",
				lineDash:[10,20],
			})
		})];
	}
});

let mapboxAllLayer = new ol.layer.VectorTile({
	source: new ol.source.VectorTile({
		attributions: '© <a href="https://www.mapbox.com/map-feedback/">Mapbox</a> ' +
		'© <a href="https://www.openstreetmap.org/copyright">' +
		'OpenStreetMap contributors</a>',
		format: new ol.format.MVT({/*layers:"admin"*/}),
		tileGrid: new ol.tilegrid.createXYZ({/*minZoom: 11, maxZoom: 22*/}),
		url: 'https://{a-d}.tiles.mapbox.com/v4/mapbox.mapbox-streets-v7/{z}/{x}/{y}.vector.pbf?access_token=' + mapboxApiKey,
	}),
	renderMode:"image",
	style:function(feature,resolution){
		let color="#00000000";
		let width=0;
		// if(["major_rail","minor_rail"].indexOf(feature.get("class"))>=0){
			color="black";
			width=3;
		// }
		var selected = !!selection[feature.id_];
		return[new ol.style.Style({
			stroke: new ol.style.Stroke({
				color: selected?"#00000000":color,
				width: width,
				lineCap: "square",
				// lineDash:[10,20],
			})
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
		let color="#00000000";
		let width=0;
		// if(["major_rail","minor_rail"].indexOf(feature.get("class"))>=0){
			color="black";
			width=3;
		// }
		var selected = !!selection[feature.id_];
		return[new ol.style.Style({
			stroke: new ol.style.Stroke({
				color: selected?"#00000000":color,
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
		let color="#00000000";
		let width=0;
		// if(map.getView().getZoom()>=16&&feature.properties_.layer==="waterway"){
			color="black";
			width=5;
		// }
		var selected = !!selection[feature.id_];
		return[new ol.style.Style({
			stroke: new ol.style.Stroke({
				color: selected?"#00000000":color,
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
		let color="#00000000";
		let width=0;
		// if(map.getView().getZoom()>=16&&feature.properties_.layer==="waterway"){
			color="black";
			width=8;
		// }
		var selected = !!selection[feature.id_];
		return[new ol.style.Style({
			stroke: new ol.style.Stroke({
				color: selected?"#00000000":color,
				width: width,
				lineCap: "square",
			})
		})];
	}
});




let marker=[];

var iconStyle = [
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
				color: "white",
				width: 6,
		}),
		radius:12,
		})
})];

var vectorLayer = new ol.layer.Vector({
});
