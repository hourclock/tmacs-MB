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

let gsiBackLayer = new ol.layer.Tile({
	source: new ol.source.XYZ({
		url: "http://cyberjapandata.gsi.go.jp/xyz/std/{z}/{x}/{y}.png",
		attributions: "<a href='http://maps.gsi.go.jp/development/ichiran.html' target='_blank'>地理院タイル</a>",
		crossOrigin:"anonymous",
	}),
	opacity:0.5,
	}
);

const gsiRoadContents=["国道","都道府県道","高速自動車国道等","市区町村道等","3m未満","3m-5.5m未満","5.5m-13m未満","13m-19.5m未満"];

function gsiAutoRoadStyle(feature){
	let color="#00000000";
	let width=0;
	let visibility="invisible";
	if(["国道","都道府県道"].indexOf(feature.rdCtg)>=0){
		color="black";
		width=8;
		visibility="visible";
	}else if(["国道","都道府県道","高速自動車国道等"].indexOf(feature.rdCtg)>=0){
		if(map.getView().getZoom()>=14){
			color="black";
			width=5;
			visibility="visible";
		}
	}else if(["5.5m-13m未満","13m-19.5m未満"].indexOf(feature.rnkWidth)>=0){
		if(map.getView().getZoom()>=14){
			color="black";
			width=5;
			visibility="visible";
		}
	}else{
		if(map.getView().getZoom()>=16){
			color="black";
			width=5;
			visibility="visible";
		}
	}
	return {color:color,width:width,visibility:visibility};
}

function gsiSelectRoadStyle(feature){
	let color="#00000000";
	let width=0;
	let visibility="invisible";

	let select=$("#layer").val();
	for(value in select){
		if(["3m未満","3m-5.5m未満","5.5m-13m未満","13m-19.5m未満"].indexOf(select[value])>=0){
			if(feature.rnkWidth == select[value]){
				color="black";
				width=5;
				visibility="visible";
			}
		}else{
			if(feature.rdCtg == select[value]){
				color="black";
				width=5;
				visibility="visible";
			}
		}
	}
	return {color:color,width:width,visibility:visibility};
}

let gsiRoadLayer = new ol.layer.VectorTile({
	source: new ol.source.VectorTile({
		attributions:  "<a href='http://maps.gsi.go.jp/development/ichiran.html' target='_blank'>地理院タイル</a>",
		format: new ol.format.GeoJSON(),
		projection: 'EPSG:4326',
		tileGrid: new ol.tilegrid.createXYZ({minZoom: 16, maxZoom: 16}),
		url: 'http://cyberjapandata.gsi.go.jp/xyz/experimental_rdcl/{z}/{x}/{y}.geojson',
	}),
	style:function(feature,resolution){
		let style;
		if($(".layerconfig").prop('checked')){
			style = gsiSelectRoadStyle(feature);
		}else{
			style = gsiAutoRoadStyle(feature);
		}
		return[new ol.style.Style({
			stroke: new ol.style.Stroke({
				color: style.color,
				width: style.width,
				lineCap: "square",
			})
		})];
	}
});

let gsiRailLayer = new ol.layer.VectorTile({
	source: new ol.source.VectorTile({
		attributions:  "<a href='http://maps.gsi.go.jp/development/ichiran.html' target='_blank'>地理院タイル</a>",
		format: new ol.format.GeoJSON(),
		projection: 'EPSG:3857',
		tileGrid: new ol.tilegrid.createXYZ({minZoom: 16, maxZoom: 16}),
		url: 'http://cyberjapandata.gsi.go.jp/xyz/experimental_railcl/{z}/{x}/{y}.geojson'
	}),
	style: new ol.style.Style({
		stroke: new ol.style.Stroke({
			color: 'black',
			width: 10,
			lineCap: "butt",
			lineDash:[10,5],
		})
	})
});

let gsiWaterLayer = new ol.layer.VectorTile({
	source: new ol.source.VectorTile({
		attributions:  "<a href='http://maps.gsi.go.jp/development/ichiran.html' target='_blank'>地理院タイル</a>",
		format: new ol.format.GeoJSON(),
		projection: 'EPSG:3857',
		tileGrid: new ol.tilegrid.createXYZ({minZoom: 16, maxZoom: 16}),
		url: 'http://cyberjapandata.gsi.go.jp/xyz/experimental_rvrcl/{z}/{x}/{y}.geojson'
	}),
	style:function(feature){
		if(map.getView().getZoom()>15&&feature.get('type') == "河川中心線（通常部）"){
			return new ol.style.Style({
				stroke: new ol.style.Stroke({
					color: 'black',
					width: 10,
					lineCap:"round",
					lineDash:[0.5,15],
				})
			});
		}else{
			return new ol.style.Style({
				stroke: new ol.style.Stroke({
					color: '#00000000',
					width: 0,
					lineCap: "butt",
				})
			});
		}
	}
});

//もし誰かが引き継ぐならmapboxのアカウント自分で取ってAPIキー自分の物に差し替えて
const mapboxApiKey= 'pk.eyJ1Ijoic2FuZGNsb2NrIiwiYSI6ImNqbnZkdHdtdDBsemMzcW14cWhoaXJhZWkifQ.QgCrVouZ9aTkeTU3De9UrQ';

const mapboxRoadContents=["street","track","link","street_limited","service","secondary","trunk","primary","tertiary","motorway"];

function mapboxAutoRoadStyle(feature){
	let color = "#00000000";
	let width = 0;
	let visibility="invisible";
	if(map.getView().getZoom()>=16){
		if(["street","track","link","street_limited","service"].indexOf(feature.class)>=0){
			color="black";
			width=5;
			visibility="visible";
		}
	}
	if(map.getView().getZoom()>=13){
		if(["secondary","trunk","primary","tertiary"].indexOf(feature.class)>=0){
			color="black";
			width=5;
			visibility="visible";
		}
	}
	if(map.getView().getZoom()>=10){
		if(["motorway"].indexOf(feature.class)>=0){
			color="black";
			width=5;
			visibility="visible";
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
		}
	}
	return {color:color,width:width,visibility:visibility};
}

let mapboxRoadLayer = new ol.layer.VectorTile({
	source: new ol.source.VectorTile({
		attributions: '© <a href="https://www.mapbox.com/map-feedback/">Mapbox</a> ' +
		'© <a href="https://www.openstreetmap.org/copyright">' +
		'OpenStreetMap contributors</a>',
		format: new ol.format.MVT({layers:"road"}),
		url: 'https://{a-d}.tiles.mapbox.com/v4/mapbox.mapbox-streets-v7/{z}/{x}/{y}.vector.pbf?access_token=' + mapboxApiKey,
	}),
	style:function(feature,resolution){
		let style;
		if($(".layerconfig").prop('checked')){
			style= mapboxSelectRoadStyle(feature.properties_);
		}else{
			style= mapboxAutoRoadStyle(feature.properties_);
		}
		return[new ol.style.Style({
		stroke: new ol.style.Stroke({
			color: style.color,
			width: style.width,
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
		url: 'https://{a-d}.tiles.mapbox.com/v4/mapbox.mapbox-streets-v7/{z}/{x}/{y}.vector.pbf?access_token=' + mapboxApiKey,
	}),
	style:function(feature,resolution){
		let color="#00000000";
		let width=0;
		if(["major_rail","minor_rail"].indexOf(feature.get("class"))>=0){
			color="black";
			width=5;
		}
		return[new ol.style.Style({
			stroke: new ol.style.Stroke({
				color: color,
				width: width,
				lineCap: "square",
				lineDash:[10,20],
			})
		})];
	}
});

let mapboxWaterLayer = new ol.layer.VectorTile({
	source: new ol.source.VectorTile({
		attributions: '© <a href="https://www.mapbox.com/map-feedback/">Mapbox</a> ' +
		'© <a href="https://www.openstreetmap.org/copyright">' +
		'OpenStreetMap contributors</a>',
		format: new ol.format.MVT({layers:"waterarea"}),
		url: 'https://{a-d}.tiles.mapbox.com/v4/mapbox.mapbox-streets-v7/{z}/{x}/{y}.vector.pbf?access_token=' + mapboxApiKey,
	}),
	style:function(feature,resolution){
		let color="#00000000";
		let width=0;
		if(map.getView().getZoom()>=16){
			color="black";
			width=5;
		}
		return[new ol.style.Style({
			stroke: new ol.style.Stroke({
				color: color,
				width: width,
				lineCap: "square",
			})
		})];
	}
});