//1. 表示するレイヤの準備
//1.1 背景レイヤ
//1.1.1OpenStreetMap
let osmBackLayer = new ol.layer.Tile({
	source: new ol.source.OSM(),
	opacity:0.5,
	}
);
//1.1.2 Bing
let bingBackLayer = new ol.layer.Tile({
	source: new ol.source.BingMaps({
		key: 'AszwABNoPgkdx0WBY9mWxqQrA0KVt31moIe2OxNubCdN7ApfhKfDhXQ50mc34Nn4',
		imagerySet: "Road",
		crossOrigin:"anonymous",
	}),
	opacity:0.5,
	}
);
//1.1.3 国土地理院（白地図）
let gsiBackLayer = new ol.layer.Tile({
	source: new ol.source.XYZ({
		url: "http://cyberjapandata.gsi.go.jp/xyz/std/{z}/{x}/{y}.png",
		attributions: "<a href='http://maps.gsi.go.jp/development/ichiran.html' target='_blank'>地理院タイル</a>",
		crossOrigin:"anonymous",
	}),
	opacity:0.5,
	}
);
//1.1 END

//1.2 触地図レイヤ
//1.2.1 国土地理院ベクトルタイル
//1.2.1.1 道路
let gsiRoadContents=["国道","都道府県道","高速自動車国道等","市区町村道等","3m未満","3m-5.5m未満","5.5m-13m未満","13m-19.5m未満"];
function gsiAutoRoadStyle(feature){
let color="black";
	let width,lineCap;
	if(feature.get('rdCtg') == "国道" || feature.get('rdCtg') == "都道府県道"){
		width=8;
	}else if(feature.get('rdCtg')== "高速自動車国道等"){
		if(map.getView().getZoom()>=14){
			width=5;
		}else{
			color="#00000000";
			width=0;
		}
	}else if(feature.get('rnkWidth')== "5.5m-13m未満"||feature.get('rnkWidth')== "13m-19.5m未満"){
		if(map.getView().getZoom()>=14){
			width=5;
		}else{
			color="#00000000";
			width=0;
		}
	}else{
		if(map.getView().getZoom()>=16){
			width=5;
		}
	}
	return[new ol.style.Style({
		stroke: new ol.style.Stroke({
			color: color,
			width: width,
			lineCap: "square",
		})
	})];
}

function gsiSelectRoadStyle(feature){
	let color="#00000000";
	let width=0;

	let temp=$("#layer").val();
	for(value in temp){
		if(temp[value]=="3m未満"||temp[value]=="3m-5.5m未満"||temp[value]=="5.5m-13m未満"||temp[value]=="13m-19.5m未満"){
			if(feature.get('rnkWidth') == temp[value]){
				color="black";
				width=5;
			}
		}else{
			if(feature.get('rdCtg') == temp[value]){
				color="black";
				width=5;
			}
		}
	}
	return[new ol.style.Style({
		stroke: new ol.style.Stroke({
			color: color,
			width: width,
			lineCap: "square",
		})
	})];
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
		if($(".layerconfig").prop('checked')){
			return gsiSelectRoadStyle(feature);
		}else{
			return gsiAutoRoadStyle(feature);
		}
	}
});
//1.2.1.2 鉄道
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
//1.2.1.3 河川
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

//1.2.2 mapbox(OSM)
let mapboxApiKey= 'pk.eyJ1Ijoic2FuZGNsb2NrIiwiYSI6ImNqbnZkdHdtdDBsemMzcW14cWhoaXJhZWkifQ.QgCrVouZ9aTkeTU3De9UrQ';
//1.2.2.1 道路

let mapboxRoadContents=["street","track","link","street_limited","service","secondary","trunk","primary","tertiary","motorway"];
function mapboxAutoRoadStyle(feature){
	// console.log(feature);
	let color = "#00000000";
	let width = 0;
	if(map.getView().getZoom()>=16){
		if(feature.get("class")=="street"||feature.get("class")=="track"||feature.get("class")=="link"||feature.get("class")=="street_limited"||feature.get("class")=="service"){
			color="black";
			width=5;
		}
	}
	if(map.getView().getZoom()>=13){
		if(feature.get("class")=="secondary"||feature.get("class")=="trunk"||feature.get("class")=="primary"||feature.get("class")=="tertiary"){
			color="black";
			width=5;
		}
	}
	if(map.getView().getZoom()>=10){
		if(feature.get("class")=="motorway"){
			color="black";
			width=5;
		}
	}
	return[new ol.style.Style({
		stroke: new ol.style.Stroke({
			color: color,
			width: width,
			lineCap: "square",
		})
	})];
}

function mapboxSelectRoadStyle(feature){
	// console.log(feature);
	let color = "#00000000";
	let width = 0;
	let temp=$("#layer").val();
	for(value in temp){
		if(feature.get("class")==temp[value]){
			color="black";
			width=5;
		}
	}
	return[new ol.style.Style({
		stroke: new ol.style.Stroke({
			color: color,
			width: width,
			lineCap: "square",
		})
	})];
}

let mapboxRoadLayer = new ol.layer.VectorTile({
	source: new ol.source.VectorTile({
		attributions: '© <a href="https://www.mapbox.com/map-feedback/">Mapbox</a> ' +
		'© <a href="https://www.openstreetmap.org/copyright">' +
		'OpenStreetMap contributors</a>',
		format: new ol.format.MVT({layers:"road"}),
		url: 'https://{a-d}.tiles.mapbox.com/v4/mapbox.mapbox-streets-v7/' +'{z}/{x}/{y}.vector.pbf?access_token=' + mapboxApiKey,
	}),
	style:function(feature,resolution){
		if($(".layerconfig").prop('checked')){
			return mapboxSelectRoadStyle(feature);
		}else{
			return mapboxAutoRoadStyle(feature);
		}
	}
});
//1.2.2.2 鉄道
let mapboxRailLayer = new ol.layer.VectorTile({
	source: new ol.source.VectorTile({
		attributions: '© <a href="https://www.mapbox.com/map-feedback/">Mapbox</a> ' +
		'© <a href="https://www.openstreetmap.org/copyright">' +
		'OpenStreetMap contributors</a>',
		format: new ol.format.MVT({layers:"road"}),
		url: 'https://{a-d}.tiles.mapbox.com/v4/mapbox.mapbox-streets-v7/' +'{z}/{x}/{y}.vector.pbf?access_token=' + mapboxApiKey,
	}),
	style:function(feature,resolution){
		let color="#00000000";
		let width=0;
		if(feature.properties_.class=="major_rail"||feature.properties_.class=="minor_rail"){
			color="black";
			switch(map.getView().getZoom()){
				case 19:
					width=5;
					break;
				case 18:
					width=5;
					break;
				case 17:
					width=5;
					break;
				case 16:
					width=5;
					break;
			}
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
//1.2.2.3 河川
let mapboxWaterLayer = new ol.layer.VectorTile({
	source: new ol.source.VectorTile({
		attributions: '© <a href="https://www.mapbox.com/map-feedback/">Mapbox</a> ' +
		'© <a href="https://www.openstreetmap.org/copyright">' +
		'OpenStreetMap contributors</a>',
		format: new ol.format.MVT({layers:"waterarea"}),
		url: 'https://{a-d}.tiles.mapbox.com/v4/mapbox.mapbox-streets-v7/' +'{z}/{x}/{y}.vector.pbf?access_token=' + mapboxApiKey,
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
//1.2 END
//1.END