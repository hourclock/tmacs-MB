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
		},
	}),
});
// map.getView().setMinZoom(5);
// map.getView().setMaxZoom(22);

//コピペだがこれで地図がダブルクリックでズームしなくなる。編集の削除でダブルクリックを戻る動作にしたかったためこれを用いた
let dblClickInteraction;
map.getInteractions().getArray().forEach(function(interaction) {
  if (interaction instanceof ol.interaction.DoubleClickZoom) {
    dblClickInteraction = interaction;
  }
});
map.removeInteraction(dblClickInteraction);


//mapの変更後に呼び出される
map.on("moveend",
	function(){
		$("#scale_input").val(Math.round(map.getView().getZoom()*10)/10);//ズームレベルを更新
		$("#rotate_input").val(Math.round(map.getView().getRotation()*180/Math.PI));//角度を更新
		let mapscale =Math.round( 96*39.37*156543.04*Math.cos(ol.proj.transform(map.getView().getCenter(),"EPSG:3857", "EPSG:4326")[1]*Math.PI/180)/(Math.pow(2,map.getView().getZoom())));
		$("#mapScale_input").val(mapscale);//縮尺を更新
	}
);


$('#layer').multiselect({
	nonSelectedText:"なし",
	includeSelectAllOption:true,
	selectAllText:"すべて選択",
});
$("#layer").multiselect("disable");

//使用するレイヤを連想配列に格納
let Layers={
	back:{//背景画像はここに
		osm       : osmBackLayer,
		mapbox    : mapboxBackLayer,
		bing      : bingBackLayer,
		gsi       : gsiBackLayer,
		satellite : satelliteBackLayer,
	},
	tactile:{//触地図レイヤーはここに
		mapbox:{
			braille   : brailleLayer,
			river     : mapboxRiverPolygonLayer,
			rail      : mapboxRailLayer,
			road      : mapboxRoadLayer,
			all       : mapboxAllLayer,
			building  : mapboxBuildingLayer,
			coastline : mapboxCoastlineLayer,
			admin     : mapboxAdminLayer,
			line      : lineLayer,
			marker    : markerLayer,
			direction : directionLayer,
		},
		// xxx:{//mapboxしか現在ないが、別サービスを使う際は（仮にxxxというサービスを使うとすると以下のコメントアウト部分みたいに追加して）、下のStatusのtactileを"xxx"にすると使うことができる
		// 	braille   : brailleLayer,
		// 	river     : xxxRiverLayer,
		// 	rail      : xxxRailLayer,
		// 	road      : xxxRoadLayer,
		// 	all       : xxxAllLayer,
		// 	building  : xxxBuildingLayer,
		// 	coastline : xxxCoastlineLayer,
		// 	admin     : xxxAdminLayer,
		// 	line      : lineLayer,
		// 	marker    : markerLayer,
		// 	direction : directionLayer,
		// },
	}
};

//レイヤの状態を配列に格納(管理はここで一括で行う)
let Status = {
	back:"mapbox",
	tactile:"mapbox",
	switch:{
		braille   : true ,
		river     : false ,
		rail      : true ,
		road      : true ,
		all       : false,
		building  : false,
		coastline : false,
		admin     : false,
		line      : true ,
		marker    : true ,
		direction : true ,
	}
};

layersSet();

$(".gridDisplay").hide();
$("#edit-contents").hide();
$("#tactile-text").hide();
$("#tactile-sumiji").hide();

//初回読み込み時に地図が画面の上部ピッタリに表示されるように。説明文とかロゴより地図自体が大事
$(window).scrollTop($("#main").offset().top);


var cnv = document.createElement('canvas');
var ctx = cnv.getContext('2d');
var img = new Image();
img.crossOrigin = "Anonymous";
img.src = './images/dots.svg';

img.onload = function(){
  var pattern = ctx.createPattern(img, 'repeat');
  mapboxRiverPolygonLayer.setStyle(new ol.style.Style({
    fill: new ol.style.Fill({
      color: pattern
    })
  }));
};


