//3. 関数の定義
//3.1 場所
//検索機能（mapbox）
//現在位置機能
function setCenter(map,center){
	map.getView().setCenter(
		ol.proj.transform(center,"EPSG:4326", "EPSG:3857")
	);
	map.getView().setZoom(17);
}

function place(){
	navigator.geolocation.getCurrentPosition(
		function(position){//現在位置取得が成功したら呼び出される
			var lng = position.coords.longitude;
			var lat = position.coords.latitude;

			setCenter(map,[lng,lat]);
		},
		function(position){//現在位置取得が失敗したら呼び出される
			alert("位置情報取得に失敗しました。");
		});
}

function getPlaceName(){
	return document.getElementById('addr').value;
}

function getJson(placename){//同期通信だから大量のデータを取得しちゃいけない。サイトごととまる
	console.log(placename+"を検索します");
	let json=$.ajax({
		type: 'GET',
		url: "https://api.mapbox.com/geocoding/v5/mapbox.places/"+placename+".json?access_token="+mapboxApiKey,
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


function search(event){
	let container=getJson(getPlaceName());

	createSuggestions(container,"#dropdown");
	setCenter(map,container.features[0].center);

	event.stopPropagation();
	$('.dropdown-toggle').dropdown('toggle');

	return container;
}



//文字列の種類判別
function checkCharType(input, charType) {
	switch (charType) {
		case "zenkaku":// 全角文字（ひらがな・カタカナ・漢字 etc.）
			return (input.match(/^[^\x01-\x7E\xA1-\xDF]+$/)) ? true : false;
		case "hiragana":// 全角ひらがな
			return (input.match(/^[\u3041-\u3096]+$/)) ? true : false;
		case "katakana":// 全角カタカナ
			return (input.match(/^[\u30a1-\u30f6]+$/)) ? true : false;
		case "alphanumeric":// 半角英数字（大文字・小文字）
			return (input.match(/^[0-9a-zA-Z]+$/)) ? true : false;
		case "numeric":// 半角数字
			return (input.match(/^[0-9]+$/)) ? true : false;
		case "alphabetic":// 半角英字（大文字・小文字）
			return (input.match(/^[a-zA-Z]+$/)) ? true : false;
		case "upper-alphabetic":// 半角英字（大文字のみ）
			return (input.match(/^[A-Z]+$/)) ? true : false;
		case "lower-alphabetic":// 半角英字（小文字のみ）
			return (input.match(/^[a-z]+$/)) ? true : false;
		default:
			return false;
	}
}

function zenkakuToHankaku(str){
	if(checkCharType(str,"zenkaku")){
		let num = str.replace(/[Ａ-Ｚａ-ｚ０-９]/g,
			function(s){
				return String.fromCharCode(s.charCodeAt(0) - 65248);
			}
		);
		return num;
	}else{
		return str;
	}
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


//mapboxレイヤをSVG形式でD3で描写
function mapboxCreateSvg(){
	$("#svg_export").empty();
	let width = $("#map").width();
	let height = $("#map").height();
	let pi = Math.PI;
	let tau = 2 * pi;

	// 表示するズームレベルとタイルを取得するズームレベルを別個に定義
	let zoom = map.getView().getZoom();

	let center = ol.proj.transform(map.getView().getCenter(),"EPSG:3857","EPSG:4326");

	// projectionのスケールは表示するズームレベルを指定
	let projection = d3.geoMercator()
		.center(center)
		.scale(256 * Math.pow(2, zoom) / tau)
		.translate([width / 2, height / 2]);

	let path = d3.geoPath()
		.projection(projection);

	// d3.tile()のサイズにmagを掛ける
	let tile = d3.tile()
		.size([width, height]);

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
	map_svg.append("g")
			.attr("class","road")
			.attr("fill", "none")
			.attr("stroke", "rgb(0%,0%,0%)")
			.attr("stroke-opacity","1")
			.attr("stroke-width","3")
			.attr("transform","rotate("+$('#rotate_input').val()+","+width/2+","+height/2+")")
		.selectAll(".tile")
			.data(
				tile.scale(projection.scale() * tau) // magを掛ける
					.translate(
						projection([0, 0])
							.map(
								function(v){return v;}
							)
					)
			) //magを掛ける
		.enter()
		.each(function(d) {
		// このgが各タイル座標となる
			let g = d3.select(this);
			vt2geojson({
				uri: 'https://a.tiles.mapbox.com/v4/mapbox.mapbox-streets-v7/' +d[2]+'/'+d[0]+'/'+d[1]+'.vector.pbf?access_token=' + mapboxApiKey,
				layer: 'road'
			}, function (error, json) {
				if (error) throw error;
				g.selectAll(".road")
					.data(json.features.filter(
						function(feature){
							let style;
							if($(".layerconfig").prop('checked')){
								style = mapboxSelectRoadStyle(feature.properties);
							}else{
								style = mapboxAutoRoadStyle(feature.properties);
							}
							if(style.visibility=="visible"){
								return true;
							}else{
								// return false;
								return true;
							}
						}
					))
					.enter()
					.append("path")
					.attr("d", path);
		});
	});
}

function appendImage(){
	let width = $("#map").width();
	let height = $("#map").height();
	$("#svg_image").attr("xlink:href",createDataUrl())
				.attr("x","0")
				.attr("y","0")
				.attr("height",height)
				.attr("width",width);
}

function svgToText(){
	appendImage();
	let text = $("#svg_export").html();
	return text;
}


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


//クラスの表示・非表示を制御する関数
function controlDisplay(classname,state){
	let contents = document.getElementsByClassName(classname);
	for(let i = 0; i < contents.length; i++) {
		contents[i].style.display = state;
	}
}

//2. END

