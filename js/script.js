//1. 表示するレイヤの準備========================================================================================================
//1.1 背景レイヤ----------------------------------------------------------------------------------------------------------------
//1.1.1OpenStreetMap
let osm_base = new ol.layer.Tile({
	source: new ol.source.OSM(),
	opacity:0.5,
	}
);
//1.1.2 Bing
let bing_base = new ol.layer.Tile({
	source: new ol.source.BingMaps({
		key: 'AszwABNoPgkdx0WBY9mWxqQrA0KVt31moIe2OxNubCdN7ApfhKfDhXQ50mc34Nn4',
		imagerySet: "Road",
		crossOrigin:"anonymous",
	}),
	opacity:0.5,
	}
);
//1.1.3 国土地理院（白地図）
let gsi_base = new ol.layer.Tile({
	source: new ol.source.XYZ({
		url: "http://cyberjapandata.gsi.go.jp/xyz/std/{z}/{x}/{y}.png",
		attributions: "<a href='http://maps.gsi.go.jp/development/ichiran.html' target='_blank'>地理院タイル</a>",
		crossOrigin:"anonymous",
	}),
	opacity:0.5,
	}
);
//1.1 END---------------------------------------------------------------------------------------------------------------------
//1.2 触地図レイヤ-----------------------------------------------------------------------------------------------------------
//1.2.1 国土地理院ベクトルタイル
//1.2.1.1 道路
let gsi_road = new ol.layer.VectorTile({
	source: new ol.source.VectorTile({
		format: new ol.format.GeoJSON(),
		projection: 'EPSG:4326',
		tileGrid: new ol.tilegrid.createXYZ({minZoom: 16, maxZoom: 16}),
		url: 'http://cyberjapandata.gsi.go.jp/xyz/experimental_rdcl/{z}/{x}/{y}.geojson',
	}),
	style: function(feature) {
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
});

//1.2.1.2 鉄道
let gsi_rail = new ol.layer.VectorTile({
	source: new ol.source.VectorTile({
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
let gsi_water = new ol.layer.VectorTile({
	source: new ol.source.VectorTile({
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
let key= 'pk.eyJ1Ijoic2FuZGNsb2NrIiwiYSI6ImNqbnZkdHdtdDBsemMzcW14cWhoaXJhZWkifQ.QgCrVouZ9aTkeTU3De9UrQ';
//1.2.2.1 道路
let mapbox_road = new ol.layer.VectorTile({
	source: new ol.source.VectorTile({
		attributions: '© <a href="https://www.mapbox.com/map-feedback/">Mapbox</a> ' +
		'© <a href="https://www.openstreetmap.org/copyright">' +
		'OpenStreetMap contributors</a>',
		format: new ol.format.MVT({layers:"road"}),
		url: 'https://{a-d}.tiles.mapbox.com/v4/mapbox.mapbox-streets-v7/' +'{z}/{x}/{y}.vector.pbf?access_token=' + key,
	}),
	style:function(feature,resolution){
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
});

//1.2.2.2 鉄道
let mapbox_rail = new ol.layer.VectorTile({
	source: new ol.source.VectorTile({
		attributions: '© <a href="https://www.mapbox.com/map-feedback/">Mapbox</a> ' +
		'© <a href="https://www.openstreetmap.org/copyright">' +
		'OpenStreetMap contributors</a>',
		format: new ol.format.MVT({layers:"road"}),
		url: 'https://{a-d}.tiles.mapbox.com/v4/mapbox.mapbox-streets-v7/' +'{z}/{x}/{y}.vector.pbf?access_token=' + key,
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
let mapbox_water = new ol.layer.VectorTile({
	source: new ol.source.VectorTile({
		attributions: '© <a href="https://www.mapbox.com/map-feedback/">Mapbox</a> ' +
		'© <a href="https://www.openstreetmap.org/copyright">' +
		'OpenStreetMap contributors</a>',
		format: new ol.format.MVT({layers:"waterarea"}),
		url: 'https://{a-d}.tiles.mapbox.com/v4/mapbox.mapbox-streets-v7/' +'{z}/{x}/{y}.vector.pbf?access_token=' + key,
	}),
	style:function(feature,resolution){
		let color="#00000000";
		let width=0;
		switch(map.getView().getZoom()){
			case 19:
				color="black";
				width=5;
				break;
			case 18:
				color="black";
				width=5;
				break;
			case 17:
				color="black";
				width=5;
				break;
			// case 16:
			// 	color="black";
			// 	width=5;
			// 	break;
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

//1.2 END---------------------------------------------------------------------------------------------------------------------
//1.END =====================================================================================================================

//2. mapの表示=========================================================================================================
//初期位置
let defaultCenter = [138.9374791, 37.8646316];	//新潟大学
//let defaultCenter = [140.622944, 42.841269];	//ニセコ
//let defaultCenter= [126.6461628, 37.3891199];	//Songdo Convensia

//表示設定
let view = new ol.View({
	projection: "EPSG:3857",
	center: ol.proj.transform(defaultCenter, "EPSG:4326", "EPSG:3857"),
	//extent: ol.proj.transformExtent([122.9336, 24.2830, 153.9863, 45.5572], "EPSG:4326", "EPSG:3857"),// minx,miny,maxx,maxy
	maxZoom: 19,
	minZoom: 10,
	zoom: 16,
	rotation: 0,
});

//マップを<div id="map">に生成
let map = new ol.Map({
	target: 'map',
	layers: [],
	view: view,
	controls: ol.control.defaults({
		zoom: false,
		attributionOptions: {
			collapsible: false
		}
	}),
});

function createdataurl(){
	for(layer in Status.switch){
		if(Status.switch[layer]=="ON"){
			map.removeLayer(Layers.tactile[Status.tactile][layer]);
		}
	}
	map.renderSync();
	let canvas_base=new Image();
	canvas_base = map.renderer_.context_.canvas;
	canvas_base.crossOrigin="anonymous";
	let base_url=canvas_base.toDataURL();//画像URL化
	for(layer in Status["switch"]){
		if(Status["switch"][layer]=="ON"){
			map.addLayer(Layers.tactile[Status.tactile][layer]);
		}
	}
	return base_url;
}

function gsicreatesvg(){
	$("#svg_export").empty();
	let width = $("#map").width();
	let height = $("#map").height();
	let pi = Math.PI;
	let tau = 2 * pi;

	// 表示するズームレベルとタイルを取得するズームレベルを別個に定義
	let zoom = {view: map.getView().getZoom(), tile: 16};

	let center = ol.proj.transform(map.getView().getCenter(),"EPSG:3857","EPSG:4326");

	// ズームレベルの差をdzとすると、2^dzを変数magで定義
	// 今回の場合は2^(16-14)=2^2=4となる
	let mag = Math.pow(2, zoom.tile - zoom.view);

	// projectionのスケールは表示するズームレベルを指定
	let projection = d3.geoMercator()
		.center(center)
		.scale(256 * Math.pow(2, zoom.view) / tau)
		.translate([width / 2, height / 2]);

	let path = d3.geoPath()
		.projection(projection);

	// d3.tile()のサイズにmagを掛ける
	let tile = d3.tile()
		.size([width * mag, height * mag]);

	let bbox ="0 0 "+width+" "+height;
	let map_svg = d3.select(".chartcontainer").append("svg")
			.attr("class", "map")
			.attr("width", width)
			.attr("height", height)
			.attr("xmlns","http://www.w3.org/2000/svg")
			.attr("xmlns:xlink","http://www.w3.org/1999/xlink")
			.attr("viewBox",bbox);

	map_svg.append("image")
				.attr("id","svg_image");
	map_svg.selectAll(".tile")
		.data(tile
			.scale(projection.scale() * tau * mag) // magを掛ける
			.translate(
				projection([0, 0])
				.map(
					function(v){return v * mag;}
				)
			)
		) //magを掛ける
		.enter()
		.append("g")
		.attr("class","tile")
		.attr("fill", "none")
		.attr("stroke", "rgb(0%,0%,0%)")
		.attr("stroke-opacity","1")
		.attr("stroke-width","3")
		.each(function(d) {
			// このgが各タイル座標となる
			let g = d3.select(this);
			d3.json("http://cyberjapandata.gsi.go.jp/xyz/experimental_rdcl/" + d[2] + "/" + d[0] + "/" + d[1] + ".geojson", function(error, json) {
				if (error) throw error;
				g.selectAll(".road")
					.data(json.features.filter(
						function(feature){
							if(map.getView().getZoom()>=16){
								return true
							}else if(16>map.getView().getZoom()&&map.getView().getZoom()>=14){
								return feature.properties.rdCtg == "国道"||feature.properties.rdCtg=="都道府県道"||feature.properties.rdCtg=="高速自動車国道等"||feature.properties.rnkWidth=="5.5m-13m未満"||feature.properties.rnkWidth=="13m-19.5m未満";
							}else if(14>map.getView().getZoom()&&map.getView().getZoom()>=12){
								return feature.properties.rdCtg == "国道"||feature.properties.rdCtg=="都道府県道"||feature.properties.rdCtg=="高速自動車国道等";
							}else{
								return feature.properties.rdCtg == "国道"||feature.properties.rdCtg=="都道府県道";
							}
						}
					))
					.enter()
					.append("path")
					.attr("d", path);
			});
		});
}

function mapboxcreatesvg(){
	var vt2geojson = require('../../../AppData/Roaming/npm/node_modules/@mapbox/vt2geojson');
	$("#svg_export").empty();
	let width = $("#map").width();
	let height = $("#map").height();
	let pi = Math.PI;
	let tau = 2 * pi;

	// 表示するズームレベルとタイルを取得するズームレベルを別個に定義
	let zoom = {view: map.getView().getZoom(), tile: 16};

	let center = ol.proj.transform(map.getView().getCenter(),"EPSG:3857","EPSG:4326");

	// ズームレベルの差をdzとすると、2^dzを変数magで定義
	// 今回の場合は2^(16-14)=2^2=4となる
	let mag = Math.pow(2, zoom.tile - zoom.view);

	// projectionのスケールは表示するズームレベルを指定
	let projection = d3.geoMercator()
		.center(center)
		.scale(256 * Math.pow(2, zoom.view) / tau)
		.translate([width / 2, height / 2]);

	let path = d3.geoPath()
		.projection(projection);

	// d3.tile()のサイズにmagを掛ける
	let tile = d3.tile()
		.size([width * mag, height * mag]);

	let bbox ="0 0 "+width+" "+height;
	let map_svg = d3.select(".chartcontainer").append("svg")
			.attr("class", "map")
			.attr("width", width)
			.attr("height", height)
			.attr("xmlns","http://www.w3.org/2000/svg")
			.attr("xmlns:xlink","http://www.w3.org/1999/xlink")
			.attr("viewBox",bbox);

	map_svg.append("image")
				.attr("id","svg_image");
	map_svg.selectAll(".tile")
		.data(tile
			.scale(projection.scale() * tau * mag) // magを掛ける
			.translate(
				projection([0, 0])
				.map(
					function(v){return v * mag;}
				)
			)
		) //magを掛ける
		.enter()
		.append("g")
		.attr("class","tile")
		.attr("fill", "none")
		.attr("stroke", "rgb(0%,0%,0%)")
		.attr("stroke-opacity","1")
		.attr("stroke-width","3")
		.each(function(d) {
			// このgが各タイル座標となる
			let g = d3.select(this);
			vt2geojson({
				uri: 'https://a.tiles.mapbox.com/v4/mapbox.mapbox-streets-v7/' +d[2]+'/'+d[0]+'/'+d[1]+'.vector.pbf?access_token=' + key,
				layer: 'road'
			}, function (err, result) {
				if (err) throw err;
				console.log(result); // => GeoJSON FeatureCollection
				g.selectAll(".road")
					.data(result.features.filter(function(feature){
						if(map.getView().getZoom()>=16){
							return feature.properties.class=="street"||feature.properties.class=="track"||feature.properties.class=="link"||feature.properties.class=="street_limited"||feature.properties.class=="service"||feature.properties.class=="secondary"||feature.properties.class=="trunk"||feature.properties.class=="primary"||feature.properties.class=="tertiary"||feature.properties.class=="motorway";
						}else if(16>map.getView().getZoom()||map.getView().getZoom()>=13){
							return feature.properties.class=="secondary"||feature.properties.class=="trunk"||feature.properties.class=="primary"||feature.properties.class=="tertiary"||feature.properties.class=="motorway";
						}else if(13>map.getView().getZoom()||map.getView().getZoom()>=10){
							return feature.properties.class=="motorway";
						}
					}))
					.enter()
					.append("path")
					.attr("d", path);
			});
		});
}

map.on("moveend",
	function(){
		$("#scale_input").val(map.getView().getZoom());
		$("#rotate_input").val(Math.round(map.getView().getRotation()*180/Math.PI));
		if(Status.tactile=="gsi"){
			gsicreatesvg();
		}else if(Status.tactile=="mapbox"){
			mapboxcreatesvg();
		}
	}
);

//使用するレイヤを連想配列に格納
let Layers={
	base:{osm:osm_base, bing:bing_base, gsi:gsi_base},
	tactile:{
		gsi:{water:gsi_water, rail:gsi_rail, road:gsi_road},
		mapbox:{water:mapbox_water, rail:mapbox_rail, road:mapbox_road}
	}
};

//レイヤの状態を配列に格納
let Status = {
	base:"osm",
	tactile:"mapbox",
	switch:{
		water:"ON",
		rail:"ON",
		road:"ON"
	}
};

//レイヤの制御関数
function LayersSet(){
	for(base in Layers.base){//全ての背景画像を削除
		map.removeLayer(Layers.base[base]);
	}
	for(tactile in Layers.tactile){//全ての触地図レイヤを削除
		for(layer in Layers.tactile[tactile]){
			map.removeLayer(Layers.tactile[tactile][layer]);
		}
	}
	if(Status.base!="none"){//背景画像なしを除いて
		map.addLayer(Layers.base[Status.base]);//Statusにて指定された背景画像表示
	}
	if(Status.tactile!="none"){//触地図レイヤなしを除いて
		for(layer in Status.switch){
			if(Status.switch[layer]=="ON"){//StatusがONの状態のレイヤを表示
				map.addLayer(Layers.tactile[Status.tactile][layer]);
			}
		}
	}
}
LayersSet();

//クラスの表示・非表示を制御する関数
function divdisplay(classname,state){
	let contents = document.getElementsByClassName(classname);
	for(let i = 0; i < contents.length; i++) {
		contents[i].style.display = state;
	}
}

// 設定パネルの「サイズ・枠」を非表示にしておく
divdisplay("display","none");
//=====================================================================================================================
//設定パネルによる操作=====================================================================================================
//場所-----------------------------------------------------------------------------------------------
//検索機能（mapbox）
function getJSON() {
	let placename = document.getElementById('addr').value;
	var req = new XMLHttpRequest();		  // XMLHttpRequest オブジェクトを生成する
	req.onreadystatechange = function() {		  // XMLHttpRequest オブジェクトの状態が変化した際に呼び出されるイベントハンドラ
		if(req.readyState == 4 && req.status == 200){ // サーバーからのレスポンスが完了し、かつ、通信が正常に終了した場合
			let json = JSON.parse(req.responseText);
			map.getView().setCenter(
				ol.proj.transform(
					[json.features[0].center[0],json.features[0].center[1]],
					"EPSG:4326", "EPSG:3857"
				)
			);
			map.getView().setZoom(17);
		}
	};
	req.open("GET", "https://api.mapbox.com/geocoding/v5/mapbox.places/"+placename+".json?access_token=pk.eyJ1Ijoic2FuZGNsb2NrIiwiYSI6ImNqbnZkdHdtdDBsemMzcW14cWhoaXJhZWkifQ.QgCrVouZ9aTkeTU3De9UrQ", false); // HTTPメソッドとアクセスするサーバーの　URL　を指定
	req.send(null);// 実際にサーバーへリクエストを送信
}

// //現在位置機能
function myplace(){
	navigator.geolocation.getCurrentPosition(successCallback, errorCallback);
}
//現在位置取得が成功したら呼び出される
function successCallback(position) {
	var lat = position.coords.latitude;
	var lng = position.coords.longitude;

	defaultCenter=[lng,lat];
	map.getView().setCenter(ol.proj.transform(defaultCenter, "EPSG:4326", "EPSG:3857"));
	map.getView().setZoom(17);
}
//現在位置取得が失敗したら呼び出される
function errorCallback(error) {
	alert("位置情報取得に失敗しました。");
}
$(function() {
	$('#search input[type=button]').on("click", function() {
		getJSON();
	});
});
$(function() {
	$('#place input[type=button]').on("click", function() {
		myplace();
	});
});
//-------------------------------------------------------------------------------------------------
//背景地図------------------------------------------------------------------------------------------
//背景地図の切り替え
$(function() {
	$('#basemap input[type=radio]').change( function() {
		Status["base"]=this.value;
		LayersSet();
		console.log("CHANGE BASE LAYER:"+this.value);
	});
});
//-------------------------------------------------------------------------------------------------
//背景地図の透過率----------------------------------------------------------------------------------
// 背景地図の透過率
$("input[name='opacity']").TouchSpin({
	min: 0,
	max: 100,
	step: 1,
});
$(function() {
	$('#opacity_input').change(function() {
		for(base in Layers["base"])
		Layers["base"][base].setOpacity(this.value/100);
	});
});
//------------------------------------------------------------------------------------------------
//触地図------------------------------------------------------------------------------------------
//触地図のon/off
$(function() {
	$('#tactile input[type=radio]').change(function() {
		Status["tactile"]=this.value;
		document.getElementById("tactile-table").style.display=(Status["tactile"]=="none")?'none':'';
		LayersSet();
		if(Status.tactile=="gsi"){
			gsicreatesvg();
		}else if(Status.tactile=="mapbox"){
			mapboxcreatesvg();
		}
		console.log("CHANGE BASE LAYER:"+this.value);
	});
});
//-------------------------------------------------------------------------------------------------
//レイヤー-------------------------------------------------------------------------------------------
//触地図レイヤーのon/off(未完成)
$(function() {
	$('#tactile-water').change(function() {
		Status["switch"]["water"]=( $(this).prop('checked') )?"ON":"OFF";
		LayersSet();
	});
});
$(function() {
	$('#tactile-railway').change(function() {
		Status["switch"]["rail"]=( $(this).prop('checked') )?"ON":"OFF";
		LayersSet();
	});
});
$(function() {
	$('#tactile-road').change(function() {
		Status["switch"]["road"]=( $(this).prop('checked') )?"ON":"OFF";
		LayersSet();
	});
});
//-------------------------------------------------------------------------------------------------
//角度---------------------------------------------------------------------------------------------
// 地図の角度
$("input[name='rotate']").TouchSpin({
	min: -180,
	max: 180,
	step: 1,
});
$(function() {
	$('#rotate_input').change(function() {
		map.getView().setRotation( this.value * Math.PI / 180 );
	});
});
//-------------------------------------------------------------------------------------------------
//縮尺---------------------------------------------------------------------------------------------
// 縮尺の切り替え
$("input[name='scale']").TouchSpin({
	min: 10,
	max: 19,
	step: 1,
});
$(function() {
	$('#scale_input').change(function() {
		map.getView().setZoom( this.value );
	});
});
//-------------------------------------------------------------------------------------------------
//目盛り----------------------------------------------------------------------------------------------
//目盛りの表示・非表示
$(function() {
	$('#append-check').change(function() {
		if( !$(this).prop('checked')){
			divdisplay("display","none");
			console.log("Append OFF");
		}else{
			divdisplay("display","");
			console.log("Append ON");
		}
	});
});

//目盛り変更
$(function() {
	$('#grid input[type=button]').change(function(){
		if(this.value=="frame-on"){
			document.getElementById('top').style.borderBottom="1mm solid #000000";
			document.getElementById('left').style.borderRight="1mm solid #000000";
			document.getElementById('right').style.borderLeft="1mm solid #000000";
			document.getElementById('bottom').style.borderTop="1mm solid #000000";
		}else if(this.value=="frame-off"){
			document.getElementById('top').style.borderBottom="";
			document.getElementById('left').style.borderRight="";
			document.getElementById('right').style.borderLeft="";
			document.getElementById('bottom').style.borderTop="";
		}else{
			$('#top,#bottom').css("background-size","calc(100%/"+String(Number(this.value)+1)+") 100%");
			$('#left,#right').css("background-size","100% calc(100%/"+this.value+")");
		}
	});
});
//-------------------------------------------------------------------------------------------------
//保存---------------------------------------------------------------------------------------------
$(function(){
	$('#output input[type=button]').change(function(){
		//プリント========================================================================
		if( this.value == "print" ){
			console.log("SAVE:PRINT");
			$("#grid-container").height($("#map").height()+$("#topleft").height()*2);
			$("#grid-container").width($("#map").width()+$("#topleft").width()*2);
			window.print();//印刷呼び出し
			$("#grid-container").height("");
			$("#grid-container").width("");
		//PNG出力=======================================================================
		}else if( this.value == "png" ){
			console.log("SAVE:PNG");
			map.once('rendercomplete',//レンダリング終了時、1度だけ呼び出し
				function(event) {
					let canvas = event.context.canvas;//canvasを取得
					//ブラウザごとに保存動作
					if (navigator.msSaveBlob) {
						navigator.msSaveBlob(canvas.msToBlob(), 'map.png');
					} else {
						canvas.toBlob(
							function(blob) {
								saveAs(blob, 'map.png');
							}
						);
					}
				}
			);
			map.render();
		//SVG出力=======================================================================
		}else if( this.value == "svg" ){
			console.log("SAVE:SVG")
			let width = $("#map").width();
			let height = $("#map").height();
			$("#svg_image").attr("xlink:href",createdataurl())
						.attr("x","0")
						.attr("y","0")
						.attr("height",height)
						.attr("width",width);
			let text = $("#svg_export").html();
			let blob = new Blob([text],{type:"text/plain"});
			if(window.navigator.msSaveBlob){
				window.navigator.msSaveBlob(blob,"tmacs.svg");
			}else{
				saveAs(blob,"tmacs.svg");
			}
		}
	});
});

