//mapの表示
//初期位置。お好みで
let defaultCenter = [
	138.9374791, 37.8646316		//新潟大学
	//140.622944, 42.841269		//ニセコ
	//126.6461628, 37.3891199	//Songdo Convensia
];

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

//URLにズームレベルや座標を表示したいならol.hash(map)のコメントアウトを外す
//（なぜか縮尺の上限下限を無視できるようになるため停止中）
// ol.hash(map);

//mapの変更後に呼び出される
map.on("moveend",
	function(){
		$("#scale_input").val(Math.round(map.getView().getZoom()*10)/10);//縮尺を更新
		$("#rotate_input").val(Math.round(map.getView().getRotation()*180/Math.PI));//角度を更新
		if(Status.tactile=="gsi"){//現在の触地図レイヤに応じてSVG出力用に描写
			gsiCreateSvg();
		}else if(Status.tactile=="mapbox"){
			mapboxCreateSvg();
		}
	}
);

for(content in mapboxRoadContents){
	$("#layer").append(
		$("<option/>").val(mapboxRoadContents[content]).append(
			mapboxRoadContents[content]
		)
	);
}

$('#layer').multiselect({
	nonSelectedText:"なし",
	includeSelectAllOption:true,
	selectAllText:"すべて選択",
});
$("#layer").multiselect("rebuild");
$("#layer").multiselect("disable");

//使用するレイヤを連想配列に格納
let Layers={
	back:{osm:osmBackLayer, bing:bingBackLayer, gsi:gsiBackLayer},
	tactile:{
		gsi:{water:gsiWaterLayer, rail:gsiRailLayer, road:gsiRoadLayer},
		mapbox:{water:mapboxWaterLayer, rail:mapboxRailLayer, road:mapboxRoadLayer}
	}
};

//レイヤの状態を配列に格納(管理はここで一括で行う)
let Status = {
	back:"osm",
	tactile:"mapbox",
	switch:{
		water:"ON",
		rail:"ON",
		road:"ON"
	}
};

layersSet();

// 設定パネルの「サイズ・枠」を非表示にしておく
controlDisplay("gridDisplay","none");
