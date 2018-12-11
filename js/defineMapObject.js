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
	zoom: 16,
	rotation: 0,
});

//地図の高さ。微妙に上下の解説の枠が入るのが気になる。
$("#grid-container").height($("#map-row").width()/Math.sqrt(2));
$(window).resize(function(){
	$("#grid-container").height($("#map-row").width()/Math.sqrt(2));
});

$("#grid-container").width($("#map-row").width());
$(window).resize(function(){
	$("#grid-container").width($("#map-row").width());
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
map.getView().setMinZoom(5);
map.getView().setMaxZoom(22);
//URLにズームレベルや座標を表示したいならol.hash(map)のコメントアウトを外す
//（なぜか縮尺の上限下限を無視できるようになるため停止中）
// ol.hash(map);

//mapの変更後に呼び出される
map.on("moveend",
	function(){
		$("#scale_input").val(Math.round(map.getView().getZoom()*10)/10);//縮尺を更新
		$("#rotate_input").val(Math.round(map.getView().getRotation()*180/Math.PI));//角度を更新
		mapboxCreateSvg();
		// }
	}
);


//mapbox一筋にしたからそもそもhtmlに記述したほうが早い気がする（要変更）
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
	back:{
		osm:osmBackLayer,
		mapbox:mapboxBackLayer,
		bing:bingBackLayer,
		gsi:gsiBackLayer
	},
	tactile:{
		mapbox:{
			river:mapboxRiverLayer,
			rail:mapboxRailLayer,
			road:mapboxRoadLayer,
			all:mapboxAllLayer,
			building:mapboxBuildingLayer,
			coastline:mapboxCoastlineLayer,
			admin:mapboxAdminLayer
		}
	}
};

//レイヤの状態を配列に格納(管理はここで一括で行う)
let Status = {
	back:"osm",
	tactile:"mapbox",
	switch:{
		river:"ON",
		rail:"ON",
		road:"ON",
		all:"ON",
		building:"ON",
		coastline:"ON",
		admin:"ON"
	}
};

layersSet();

// 設定パネルの「サイズ・枠」を非表示にしておく
controlDisplay("gridDisplay","none");

//初回読み込み時に地図が画面の上部ピッタリに表示されるように。説明文とか名前とかより地図自体が大事だし。
$(window)
	.scrollTop($("#main").offset().top);
