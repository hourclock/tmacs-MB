//mapの表示
//初期位置 お好みで
let defaultCenter = [
	138.9374791, 37.8646316		//新潟大学
	//140.622944, 42.841269		//ニセコ
	//126.6461628, 37.3891199	//Songdo Convensia
];


//地図の高さ。微妙に上下の解説の枠が入るのが気になる。
$("#grid-container").height($("#map-row").width()/Math.sqrt(2)*0.95);//0.95は手動で調整した値のため特に意味はない。これぐらいの値だと印刷で1ページに収まる。
$(window).resize(function(){
	$("#grid-container").height($("#map-row").width()/Math.sqrt(2)*0.95);
});

$("#grid-container").width($("#map-row").width());
$(window).resize(function(){
	$("#grid-container").width($("#map-row").width());
});

//表示設定
let viewConfig = new ol.View({
	projection: "EPSG:3857",
	center: ol.proj.transform(defaultCenter, "EPSG:4326", "EPSG:3857"),
	zoom: 16,
	rotation: 0,
});

//マップを<div id="map">に生成
let map = new ol.Map({
	target: 'map',
	view: viewConfig,
	controls: ol.control.defaults({//ズームなどの地図上のコントローラーを非表示に
		zoom: false,
		attributionOptions: {
			collapsible: false
		},
	}),
});

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
		$("input[name='zoomLevel']").val(Math.round(map.getView().getZoom()*10)/10);//ズームレベルを更新
		$("input[name='rotate']").val(Math.round(map.getView().getRotation()*180/Math.PI));//角度を更新
		//"https://blogs.bing.com/maps/2006/02/25/map-control-zoom-levels-gt-resolution/"をもとに緯度とズームレベルから縮尺を算出
		let mapscale =Math.round( 96*39.37*156543.04*Math.cos(ol.proj.transform(map.getView().getCenter(),"EPSG:3857", "EPSG:4326")[1]*Math.PI/180)/(Math.pow(2,map.getView().getZoom())));
		$("input[name='scale']").val(mapscale);//縮尺を更新
	}
);


$('#layer').multiselect({
	nonSelectedText:"なし",
	includeSelectAllOption:true,
	selectAllText:"すべて選択",
	allSelectedText:"すべて",
	nSelectedText: " 種類選択済み",
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
			river     : mapboxRiverLayer,
			rail      : mapboxRailLayer,
			road      : mapboxRoadLayer,
			building  : mapboxBuildingLayer,
			coastline : mapboxCoastlineLayer,
			admin     : mapboxAdminLayer,
			line      : lineLayer,
			marker    : markerLayer,
			direction : directionLayer,
		},
		// xxx:{//mapboxしか現在ないが、別サービスを使う際のためのテンプレ
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
		river     : true ,
		rail      : true ,
		road      : true ,
		building  : false,
		coastline : false,
		admin     : false,
		line      : true ,
		marker    : true ,
		direction : true ,
	},
	editMode:"none",
	markerMode:"singleCircle",
};

layersSet();

//初回読み込み時に地図が画面の上部ピッタリに表示されるように。説明文とかロゴより地図自体が大事
$(window).scrollTop($("#main").offset().top);

//河川の点での塗りつぶし用のパターン作成
let img = new Image();//新しく画像要素を作成
//画像要素にsvg形式の点の画像を記述
// img.src = 'data:image/svg+xml;charset=utf-8,'+
// 			'<svg width="20px" height="20px" viewBox="0 0 20 20" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">'+
// 				'<g stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">'+
// 					'<g fill="#000000">'+
// 						'<circle id="Oval-377-Copy-9" cx="3" cy="3" r="3"></circle>'+
// 						'<circle id="Oval-377-Copy-14" cx="13" cy="13" r="3"></circle>'+
// 					'</g>'+
// 				'</g>'+
// 			'</svg>';

img.src="https://github.com/hourclock/tmacs-MB/tree/master/images/pattern.svg";
img.onload = function(){
	let cnv = document.createElement('canvas');//canvas要素を準備
	let ctx = cnv.getContext('2d');//canvasは平面画像として扱うと設定
	mapboxRiverLayer.setStyle(new ol.style.Style({
		fill: new ol.style.Fill({
			color: ctx.createPattern(img, 'repeat')
		})
	}));
};