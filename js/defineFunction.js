//3. 関数の定義

//座標系を変換する関数
function transform(center){
	return ol.proj.transform(center,"EPSG:4326", "EPSG:3857");
}

//地名や住所をもとにmapboxからジオコーディング、JSON形式で情報を取得する関数
function getJson(placename){//同期通信だから大量のデータを取得しちゃいけない。サイトごととまる
	console.log(placename+"を検索します");
	let json=$.ajax({//ajaxを用いて取得（よくわからん）
		type: 'GET',
		url: "https://api.mapbox.com/geocoding/v5/mapbox.places/"+placename+".json?access_token="+mapboxApiKey,
		async:false,//非同期処理を中止
		dataType: 'json',
	});
	return json.responseJSON;//取得したJSONを返す
}
//ジオコーディング結果のJSON形式から検索候補のリストを作成する関数
function createSuggestions(json,classname){
	$(classname).empty();//前回の検索結果を初期化
	for (id in json.features) {//json内のすべての検索候補について
		$(classname).append(//指定した要素内に検索候補の番号をvalueとしたリストを作成
			$("<li/>").val(id).append(
				$("<a/>").attr("class","dropdown-item").append(
					json.features[id].place_name
				)
			)
		);
	}
}
//検索を実行したときに呼び出される関数
function setSearchPosition(event,placeOption){//選択した検索候補を格納するために引数にplaceOptionを用意
	let searchWord=$('#addr').val();//検索する単語を取得
	placeOption=getJson(searchWord);//単語をもとに検索候補をJSON形式で取得
	createSuggestions(placeOption,"#dropdown");//取得した検索候補をもとにリストを作成
	let firstOption = transform(placeOption.features[0].center);//第一検索候補の座標
	map.getView().setCenter(firstOption);//第一検索候補の座標に移動
	event.stopPropagation();//たしか動作の一時停止的なコマンドだったと思う。これ入れないと次の行がうまく動かなかった
	$('.dropdown-toggle').dropdown('toggle');//検索候補のリストを展開
	return placeOption;
}
//現在位置を押したときに呼び出される関数
function setCurrentPosition(){
	navigator.geolocation.getCurrentPosition(//現在位置を取得
		function(position){//現在位置取得が成功したら呼び出される
			let lng = position.coords.longitude;
			let lat = position.coords.latitude;
			map.getView().setCenter(transform([lng,lat]));
			map.getView().setZoom(17);
		},
		function(position){//現在位置取得が失敗したら呼び出される
			alert("位置情報取得に失敗しました。");
		});
}


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

//全角なら半角に(数字以外受け付けないようにしたい)
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
		map.addLayer(Layers.back[Status.back]);//Statusにて指定された背景画像を追加
	}
	if(Status.tactile!="none"){//触地図レイヤなしを除いて
		for(switchID in Status.switch){
			if(Status.switch[switchID]===true){//StatusがONの状態のレイヤを追加
				map.addLayer(Layers.tactile[Status.tactile][switchID]);
			}
		}
	}
}

function mapboxAutoRoadStyle(feature){
	let color = [0, 0, 0, 0];
	let width = 0;
	let visibility="invisible";
	if(map.getView().getZoom()>=16){
		//a.indexOf(b)はbが配列aの何番目に現れるかを返す。現れなかったら-1を返す。これを利用して要素が存在するかを確認できる。
		if(["street","track","link","street_limited","service","path"].indexOf(feature.class)>=0){
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
	if(map.getView().getZoom()>=5){
		if(["motorway"].indexOf(feature.class)>=0){
			color="black";
			width=5;
			visibility="visible";
		}
	}
	return {
		color:color,
		width:width,
		visibility:visibility
	};
}

function mapboxSelectRoadStyle(feature){
	let color = [0, 0, 0, 0];
	let width = 0;
	let visibility="invisible";
	let select=$("#layer").val();//設定パネルの表示内容（道路）のセレクトボックスの値。選択したものが配列で取得できる
	for(value in select){
		if(feature.class===select[value]){
			color="black";
			width=5;
			visibility="visible";
		}
	}
	return {
		color:color,
		width:width,
		visibility:visibility
	};
}

function landmarkMarkerSet(coordinate){
	let markerObject = new ol.Feature({
		geometry: new ol.geom.Point(coordinate, 'XY'),
	});
	markerObject.setStyle(markerStyle);
	markerObject.setProperties({"object":"marker"});
	marker.push(markerObject);
	let markerSource = new ol.source.Vector({
		features: marker
	});
	markerLayer.setSource(markerSource);
	markerLayer.getSource().changed();
}

function brailleMarkerSet(coordinate){
	let brailleObject = new ol.Feature({
		geometry: new ol.geom.Point(coordinate, 'XY'),
	});
	let brailleString=$("#tactile-text").val();
	let stringStyle = new ol.style.Style();
	let brailleSumiji=$("#tactile-sumiji").val();
	let sumijiStyle = new ol.style.Style();
	let text = new ol.style.Text({
			fill: new ol.style.Fill({color: "black"}),
			stroke: new ol.style.Stroke({color: "black", width: 1}),
			scale: 1.6,
			textAlign: "center",
			textBaseline: "top",
			offsetY: 0,
			text: brailleString,
			font: "18px ikarashi",
		});
	let sumiji = new ol.style.Text({
			fill: new ol.style.Fill({color: "#0066ff"}),
			stroke: new ol.style.Stroke({color: "white", width: 1}),
			scale: 1.6,
			textAlign: "center",
			textBaseline: "top",
			offsetY: 25,
			text: brailleSumiji,
			font:"16px sans-serif",
		});
	stringStyle.setText(text);
	sumijiStyle.setText(sumiji);
	brailleObject.setStyle([stringStyle,sumijiStyle]);
	brailleObject.setProperties({"object":"braille"});
	braille.push(brailleObject);
	let brailleSource = new ol.source.Vector({
		features: braille
	});
	brailleLayer.setSource(brailleSource);
	brailleLayer.getSource().changed();
}
function directionMarkerSet(coordinate){
	let directionMarkerCoordinates = [//北の矢印を一筆書き（XY座標で次に線を結ぶ点を指定する）
		coordinate[0]   ,coordinate[1]   ,//（0,0）
		coordinate[0]   ,coordinate[1]-75,//（0,-75）
		coordinate[0]   ,coordinate[1]+75,//（0,75)
		coordinate[0]-75,coordinate[1]   ,//(-75,0)
		coordinate[0]   ,coordinate[1]+75,//(0,75)
		coordinate[0]+75,coordinate[1]   ,//(75,0)これを順に結ぶと矢印となる（75はズームレベル16で見やすいサイズとして決めた）
	];
	let directionMarkerGeometry= new ol.geom.LineString(directionMarkerCoordinates,"XY");
	let scale=Math.pow(2,(16-map.getView().getZoom()));//ズームレベル16を基準にしたため16から引く（ズームレベル1減ると地図は2倍）
	directionMarkerGeometry.scale(scale);//矢印の大きさをズームレベルに応じて大きくする
	let directionMarkerObject = new ol.Feature({
		geometry: directionMarkerGeometry
	});
	directionMarkerObject.setStyle(directionStyle);
	directionMarkerObject.setProperties({"object":"direction"});
	if(direction!=null){
		direction=[];
	}
	direction.push(directionMarkerObject);
	let directionSource = new ol.source.Vector({
		features: direction
	});
	directionLayer.setSource(directionSource);
	directionLayer.getSource().changed();
}

function deleteMarker(features){
	if(!!features){
		let feature=features[0];
		console.log(feature);
		if(["Positions","Point","MultiPoint","LineString","MultiLineString","Polygon","MyltiPolygon"].indexOf(feature.type_)>=0){
			let fid = feature.id_;
			selection[fid] = feature;
			for(id in Layers.tactile.mapbox){
				Layers.tactile.mapbox[id].setStyle(Layers.tactile.mapbox[id].getStyle());
			}
			return;
		}

		if(feature.values_.object==="marker"){
			let markerId = feature.ol_uid;
			let deleteMarkerId;
			for(key in marker){
				if(marker[key].ol_uid===markerId){
					deleteMarkerId=key;
				}
			}
			marker.splice(deleteMarkerId,1);
			let markerSource = new ol.source.Vector({
				features: marker
			});
			markerLayer.setSource(markerSource);
			markerLayer.getSource().changed();
			return;
		}

		if(feature.values_.object==="direction"){
			let directionId = feature.ol_uid;
			let deleteDirectionId;
			for(key in direction){
				if(direction[key].ol_uid===directionId){
					deleteDirectionId=key;
				}
			}
			direction.splice(deleteDirectionId,1);
			let directionSource = new ol.source.Vector({
				features: direction
			});
			directionLayer.setSource(directionSource);
			directionLayer.getSource().changed();
			return;
		}

		if(feature.values_.object==="braille"){
			let brailleId = feature.ol_uid;
			let deleteBrailleId;
			for(key in braille){
				if(braille[key].ol_uid===brailleId){
					deleteBrailleId=key;
				}
			}
			braille.splice(deleteBrailleId,1);
			let brailleSource = new ol.source.Vector({
				features: braille
			});
			brailleLayer.setSource(brailleSource);
			brailleLayer.getSource().changed();
			return;
		}

		if(feature.geometryName_==="drawLine"){
			lineSource.removeFeature(feature);
			lineSource.changed();
			return;
		}
	}
}

function redoSelectedFeature(){
	let keys_array = Object.keys(selection);
	let len =  keys_array.length;
	delete selection[keys_array[len-1]];//連想配列の末尾を削除
	for(id in Layers.tactile.mapbox){
		Layers.tactile.mapbox[id].setStyle(Layers.tactile.mapbox[id].getStyle());
	}
}