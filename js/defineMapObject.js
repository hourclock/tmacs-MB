//2. mapの表示
//初期位置。お好みで
let defaultCenter = [138.9374791, 37.8646316];	//新潟大学
//let defaultCenter = [140.622944, 42.841269];	//ニセコ
//let defaultCenter= [126.6461628, 37.3891199];	//Songdo Convensia

//表示設定
let viewConfig = new ol.View({
	projection: "EPSG:3857",
	center: ol.proj.transform(defaultCenter, "EPSG:4326", "EPSG:3857"),
	maxZoom: 19,
	minZoom: 10,
	zoom: 16,
	rotation: 0,
});

//地図の高さは画面の高さの9割。微妙に上下の解説の枠が入るのが気になる。
$("#map").height($(window).height()*0.9);
$(window).resize(function(){
	$("#map").height($(window).height()*0.9);
});

//マップを<div id="map">に生成
let map = new ol.Map({
	target: 'map',
	view: viewConfig,
	controls: ol.control.defaults({
		zoom: false,
		attributionOptions: {
			collapsible: false
		}
	}),
});

// ol.hash(map);
//2. END