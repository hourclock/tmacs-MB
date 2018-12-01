//3. 関数の定義

$('#layer').multiselect({
	nonSelectedText:"なし",
	includeSelectAllOption:true,
	selectAllText:"すべて選択",
});

$("#addr").focus();

//文字列の種類判別
function checkCharType(input, charType) {
	switch (charType) {
		// 全角文字（ひらがな・カタカナ・漢字 etc.）
		case "zenkaku":
			return (input.match(/^[^\x01-\x7E\xA1-\xDF]+$/)) ? true : false;
		// 全角ひらがな
		case "hiragana":
			return (input.match(/^[\u3041-\u3096]+$/)) ? true : false;
		// 全角カタカナ
		case "katakana":
			return (input.match(/^[\u30a1-\u30f6]+$/)) ? true : false;
		// 半角英数字（大文字・小文字）
		case "alphanumeric":
			return (input.match(/^[0-9a-zA-Z]+$/)) ? true : false;
		// 半角数字
		case "numeric":
			return (input.match(/^[0-9]+$/)) ? true : false;
		// 半角英字（大文字・小文字）
		case "alphabetic":
			return (input.match(/^[a-zA-Z]+$/)) ? true : false;
		// 半角英字（大文字のみ）
		case "upper-alphabetic":
			return (input.match(/^[A-Z]+$/)) ? true : false;
		// 半角英字（小文字のみ）
		case "lower-alphabetic":
			return (input.match(/^[a-z]+$/)) ? true : false;
	}
	return false;
}

//現在表示されている背景画像を取得DataURL化
function createDataUrl(){
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

//GSIレイヤをSVG形式でD3で描写
function gsiCreateSvg(){
	$("#svg_export").empty();
	let width = $("#map").width();
	let height = $("#map").height();
	let pi = Math.PI;
	let tau = 2 * pi;

	// 表示するズームレベルとタイルを取得するズームレベルを別個に定義
	let zoom = {view: map.getView().getZoom(), tile: 16};

	let center = ol.proj.transform(map.getView().getCenter(),"EPSG:3857","EPSG:4326");

	// ズームレベルの差をdzとすると、2^dzを変数magで定義
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
		.attr("transform","rotate("+$('#rotate_input').val()+","+width/2+","+height/2+")")
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

//mapboxレイヤをSVG形式でD3で描写
function mapboxCreateSvg(){
	$("#svg_export").empty();
	let width = $("#map").width();
	let height = $("#map").height();
	let pi = Math.PI;
	let tau = 2 * pi;

	// 表示するズームレベルとタイルを取得するズームレベルを別個に定義
	let zoom = {view: map.getView().getZoom(), tile: 16};

	let center = ol.proj.transform(map.getView().getCenter(),"EPSG:3857","EPSG:4326");

	// ズームレベルの差をdzとすると、2^dzを変数magで定義
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
		.attr("transform","rotate("+$('#rotate_input').val()+","+width/2+","+height/2+")")
		.each(function(d) {
			// このgが各タイル座標となる
			let g = d3.select(this);
			vt2geojson({
				uri: 'https://a.tiles.mapbox.com/v4/mapbox.mapbox-streets-v7/' +d[2]+'/'+d[0]+'/'+d[1]+'.vector.pbf?access_token=' + mapboxApiKey,
				layer: 'road'
			}, function (err, result) {
				if (err) throw err;
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

//レイヤの制御関数
function layersSet(){
	for(backID in Layers.back){//全ての背景画像を削除
		map.removeLayer(Layers.back[backID]);
	}
	for(tactileID in Layers.tactile){//全ての触地図レイヤを削除
		for(layerID in Layers.tactile[tactileID]){
			map.removeLayer(Layers.tactile[tactileID][layerID]);
		}
	}
	if(Status.back!="none"){//背景画像なしを除いて
		map.addLayer(Layers.back[Status.back]);//Statusにて指定された背景画像表示
	}
	if(Status.tactile!="none"){//触地図レイヤなしを除いて
		for(switchID in Status.switch){
			if(Status.switch[switchID]=="ON"){//StatusがONの状態のレイヤを表示
				map.addLayer(Layers.tactile[Status.tactile][switchID]);
			}
		}
	}
}
layersSet();

//クラスの表示・非表示を制御する関数
function controlDisplay(classname,state){
	let contents = document.getElementsByClassName(classname);
	for(let i = 0; i < contents.length; i++) {
		contents[i].style.display = state;
	}
}

// 設定パネルの「サイズ・枠」を非表示にしておく
controlDisplay("gridDisplay","none");


//2. END
//3. 設定パネル内の動作
//3.1 場所
//検索機能（mapbox）
//現在位置機能
function place(){
	navigator.geolocation.getCurrentPosition(successCallback, errorCallback);
}
//現在位置取得が成功したら呼び出される
function successCallback(position) {
	var lat = position.coords.latitude;
	var lng = position.coords.longitude;

	map.getView().setCenter(ol.proj.transform([lng,lat], "EPSG:4326", "EPSG:3857"));
	map.getView().setZoom(17);
}
//現在位置取得が失敗したら呼び出される
function errorCallback(error) {
	console.log("位置情報取得に失敗しました。");
}

function getPlaceName(){
	return document.getElementById('addr').value;
}

function getJson(placename){//同期通信だから大量のデータを取得しちゃいけない
	console.log(placename+"を検索します");
	let json=$.ajax({
		type: 'GET',
		url: "https://api.mapbox.com/geocoding/v5/mapbox.places/"+placename+".json?access_token=pk.eyJ1Ijoic2FuZGNsb2NrIiwiYSI6ImNqbnZkdHdtdDBsemMzcW14cWhoaXJhZWkifQ.QgCrVouZ9aTkeTU3De9UrQ",
		async:false,//非同期処理を中止
		dataType: 'json',
	});
	return json.responseJSON;
}

function createSuggestions(json,classname){
	$(classname).empty();
	for (id in json.features) {
		$("#dropdown").append(
			$("<li/>").val(id).append(
				$("<a/>").attr("class","dropdown-item").append(
					json.features[id].place_name
				)
			)
		);
	}
}

function setCenter(map,json,id){
	map.getView().setCenter(
		ol.proj.transform(
			[json.features[id].center[0],json.features[id].center[1]],
			"EPSG:4326", "EPSG:3857"
		)
	);
	map.getView().setZoom(17);
}
$(function(){//検索が押されたら候補用のドロップダウンを表示
	let searchResult;
	function search(event){
		searchResult=getJson(getPlaceName());
		createSuggestions(searchResult,"#dropdown");
		setCenter(map,searchResult,0);
		event.stopPropagation();
		$('.dropdown-toggle').dropdown('toggle');
	}
	$('#search button[type=button]').on("click", function(event){
		search(event);
	});
	$('#search input[type=text]').complete(function(event){
		search(event);
	});

	$(document).on("click", "#dropdown li" ,function() {
		setCenter(map,searchResult,$(this).val());
	});

	$('#place input[type=button]').on("click", function() {
		place();
	});
});


//3.1 END
//3.2 背景地図
//背景地図の切り替え
$(function() {
	$('#basemap input[type=radio]').change( function() {
		Status.back=this.value;
		layersSet();
		console.log("CHANGE BASE LAYER:"+this.value);
	});
});
//3.2 END
//3.3 背景地図の透過率
// 背景地図の透過率
$("input[name='opacity']").TouchSpin({
	min: 0,
	max: 100,
	step: 1,
});
$(function() {
	$('#opacity_input').change(function() {
		if(checkCharType(this.value,"zenkaku")){
			let num = this.value.replace(/[Ａ-Ｚａ-ｚ０-９]/g,
				function(s){
					return String.fromCharCode(s.charCodeAt(0) - 65248);
				}
			);
			$('#opacity_input').val(num);
			for(backID in Layers.back){
				Layers.back[backID].setOpacity(num/100);
			}
		}else{
			for(backID in Layers.back){
				Layers.back[backID].setOpacity(this.value/100);
			}
		}
	});
});
//3.3 END
//3.4 触地図
//触地図のon/off
$(function() {
	$('#tactile input[type=radio]').change(function() {
		Status.tactile=this.value;
		if(Status.tactile=="none"){
			controlDisplay("tactileLayer","none");
		}else{
			controlDisplay("tactileLayer","");
		}
		// document.getElementById("tactile-table").style.display=(Status["tactile"]=="none")?'none':'';
		// document.getElementById("layerconfig").style.display=(Status["tactile"]=="none")?'none':'';
		layersSet();
		if(Status.tactile=="gsi"){
			gsiCreateSvg();
			$("select#layer option").remove();
			gsiRoadLayer.getSource().changed();
			for(value in gsiRoadContents){
				$("#layer").append(
					$("<option/>").val(gsiRoadContents[value]).append(
						gsiRoadContents[value]
					)
				);
			}
			$('#layer').multiselect('rebuild')
		}else if(Status.tactile=="mapbox"){
			mapboxCreateSvg();
			$("select#layer option").remove();
			mapboxRoadLayer.getSource().changed();
			for(value in mapboxRoadContents){
				$("#layer").append(
					$("<option/>").val(mapboxRoadContents[value]).append(
						mapboxRoadContents[value]
					)
				);
			}
			$('#layer').multiselect('rebuild')
		}
		console.log("CHANGE BASE LAYER:"+this.value);
	});
});
//3.4 END
//3.5 レイヤ
//触地図レイヤーのon/off(未完成)
$(function() {
	$('#tactile-water').change(function() {
		Status["switch"]["water"]=( $(this).prop('checked') )?"ON":"OFF";
		layersSet();
	});
});
$(function() {
	$('#tactile-railway').change(function() {
		Status["switch"]["rail"]=( $(this).prop('checked') )?"ON":"OFF";
		layersSet();
	});
});
$(function() {
	$('#tactile-road').change(function() {
		Status["switch"]["road"]=( $(this).prop('checked') )?"ON":"OFF";
		layersSet();
	});
});
//3.5 END
//3.6 角度
// 地図の角度
$("input[name='rotate']").TouchSpin({
	min: -180,
	max: 180,
	step: 1,
});
$(function() {
	$('#rotate_input').change(function() {
		if(checkCharType(this.value,"zenkaku")){
			let num = this.value.replace(/[Ａ-Ｚａ-ｚ０-９]/g,
				function(s){
					return String.fromCharCode(s.charCodeAt(0) - 65248);
				}
			);
			$('#rotate_input').val(num);
			map.getView().setRotation( num * Math.PI / 180 );
		}else{
			map.getView().setRotation( this.value * Math.PI / 180 );
		}
	});
});
//3.6 END
//3.7 縮尺
// 縮尺の切り替え
$("input[name='scale']").TouchSpin({
	min: 10,
	max: 19,
	step: 0.1,
	decimals:1,
});
$(function() {
	$('#scale_input').on("change",function() {
		if(checkCharType(this.value,"zenkaku")){
			let num = this.value.replace(/[Ａ-Ｚａ-ｚ０-９]/g,
				function(s){
					return String.fromCharCode(s.charCodeAt(0) - 65248);
				}
			);
			$('#scale_input').val(num);
			map.getView().setZoom( num );
		}else{
			map.getView().setZoom(this.value);
		}
	});
});
//3.7 END
//3.8 目盛り
//目盛りの表示・非表示
$(function() {
	$('#append-check').change(function() {
		if( !$(this).prop('checked')){
			controlDisplay("gridDisplay","none");
			console.log("Append OFF");
		}else{
			controlDisplay("gridDisplay","");
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
//3.8 END
//3.9 保存
$(function(){
	$('#output input[type=button]').change(function(){
		//プリント
		if( this.value == "print" ){
			console.log("SAVE:PRINT");
			// let width = $("#map").width();
			// let height = $("#map").height();
			// if(height*Math.sqrt(2)>=width){
			// 	$("#grid-container").height(680);
			// 	$("#grid-container").width(width*680/height);
			// }else{
			// 	$("#grid-container").height(height*849/width);
			// 	$("#grid-container").width(849);
			// }
			window.print();//印刷呼び出し
			// $("#grid-container").height("");
			// $("#grid-container").width("");
		//PNG出力
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
		//SVG出力
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
//3.9 END

$(function() {
	$('#layer').change(function(){
		mapboxRoadLayer.getSource().changed();
		gsiRoadLayer.getSource().changed();
	});
});



$(function() {
	$('.layerconfig').change(function(){
		if($(".layerconfig").prop('checked')){
			$("#layer").multiselect("enable");
		}else{
			$("#layer").multiselect("disable");
		}
		mapboxRoadLayer.getSource().changed();
		gsiRoadLayer.getSource().changed();
	});
});
