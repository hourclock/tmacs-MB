//3. 関数の定義

//地名や住所をもとにmapboxからジオコーディングし、JSON形式で情報を取得する関数
function getJson(placeName){//同期処理だから大量のデータを取得しちゃいけない。サイトごととまる
	let json=$.ajax({//ajaxを用いて取得（よくわからん）
		type: 'GET',
		url: "https://api.mapbox.com/geocoding/v5/mapbox.places/"+placeName+".json?access_token="+mapboxApiKey,
		async:false,//非同期処理を中止
		dataType: 'json',
	});
	return json.responseJSON;//取得したJSONを返す
}

//ジオコーディング結果のJSON形式から検索候補のリストを作成する関数
function createSuggestions(json,className){
	$(className).empty();//前回の検索結果を初期化
	for (id in json.features) {//json内のすべての検索候補について
		$(className).append(//指定した要素内に検索候補の番号をvalueとしたリストを作成
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
	let searchWord=$('#search input').val();//検索する単語を取得
	placeOption=getJson(searchWord);//単語をもとに検索候補をJSON形式で取得
	createSuggestions(placeOption,"#dropdown");//取得した検索候補をもとにリストを作成

	let firstOption = ol.proj.transform((placeOption.features[0].center),"EPSG:4326", "EPSG:3857");//第一検索候補の座標
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
			map.getView().setCenter(ol.proj.transform([lng,lat],"EPSG:4326", "EPSG:3857"));
			map.getView().setZoom(17);
		},
		function(position){//現在位置取得が失敗したら呼び出される
			alert("位置情報取得に失敗しました。");
		});
}

//文字列の種類を判定する関数（ネットの丸パクリ）
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

//全角なら半角に(TODO:数字以外受け付けないようにしたい)
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

//道路の表示内容変更機能（自動）
function mapboxAutoRoadStyle(feature){
	let color = [0, 0, 0, 0];//基本は道路の表示色は透明で
	let width = 0;//太さは0
	let visibility="invisible";//この状態をinvisibleとする
	if(map.getView().getZoom()>=16){
		//a.indexOf(b)はbが配列aの何番目に現れるかを返す。現れなかったら-1を返す。これを利用して要素が存在するかを確認できる。
		if(["street","track","link","street_limited","service","path"].indexOf(feature.class)>=0){//もしこれらのタグがあるならば
			color="black";
			width=4;
			visibility="visible";
		}//色を黒、太さ４、状態visibleとして設定しなおす
	}
	if(map.getView().getZoom()>=13){//以下略
		if(["secondary","trunk","primary","tertiary"].indexOf(feature.class)>=0){
			color="black";
			width=7;
			visibility="visible";
		}
	}
	if(map.getView().getZoom()>=5){
		if(["motorway"].indexOf(feature.class)>=0){
			color="black";
			width=10;
			visibility="visible";
		}
	}
	return {//色、太さ、可視・不可視の状態を返す
		color:color,
		width:width,
		visibility:visibility
	};
}

//道路の表示内容変更機能（手動）
function mapboxSelectRoadStyle(feature){
	let color = [0, 0, 0, 0];
	let width = 0;
	let visibility="invisible";
	let select=$("#layer").val();//設定パネルの表示内容（道路）のセレクトボックスの値。選択したものが配列で取得できる
	for(value in select){
		if(feature.class===select[value]){//セレクトボックス内の値が存在すれば
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

//マーカー機能
function landmarkMarkerSet(coordinate){
	//マーカーを表すオブジェクトを用意
	let markerObject = new ol.Feature({
		geometry: new ol.geom.Point(coordinate, 'XY'),
	});
	//丸か点のスタイルをオブジェクトに適用
	switch(Status.markerMode){
		case "singleCircle":
			markerObject.setStyle(singleCircleStyle);
			break;
		case "pointMarker":
			markerObject.setStyle(pointMarkerStyle);
			break;
	};
	//オブジェクトのプロパティにmarkerを設定
	markerObject.setProperties({"object":"marker"});
	//オブジェクトを配列markerにまとめる
	marker.push(markerObject);
	//配列markerをもとにしたデータソースを作成
	let markerSource = new ol.source.Vector({
		features: marker
	});
	//マーカー用のレイヤに登録
	markerLayer.setSource(markerSource);
	//更新
	markerLayer.getSource().changed();
}

//点字機能
function brailleMarkerSet(coordinate){
	//点字と墨字をテキストボックスから取得
	let brailleText=$("#braille-text").val();
	let brailleSumiji=$("#braille-sumiji").val();
	//点字のスタイルを用意
	let textStyle = new ol.style.Style({
		text:new ol.style.Text({
			fill: new ol.style.Fill({
				color: "black"
			}),
			stroke: new ol.style.Stroke({
				color: "black",
				width: 1
			}),
			scale: 1.6,
			textAlign: "center",
			textBaseline: "top",
			offsetY: 0,
			text: brailleText,
			font: "18px ikarashi",
		}),
	});
	//墨字のスタイルを用意
	let sumijiStyle = new ol.style.Style({
		text:new ol.style.Text({
			fill: new ol.style.Fill({
				color: "#0066ff"
			}),
			stroke: new ol.style.Stroke({
				color: "white",
				width: 1
			}),
			scale: 1.6,
			textAlign: "center",
			textBaseline: "top",
			offsetY: 30,
			text: brailleSumiji,
			font:"16px sans-serif",
		}),
	});

	//点字マーカーのオブジェクトを作成し、座標を登録
	let brailleObject = new ol.Feature({
		geometry: new ol.geom.Point(coordinate, 'XY'),
	});
	//オブジェクトにスタイルを適用
	brailleObject.setStyle([textStyle,sumijiStyle]);
	//オブジェクトにプロパティを設定
	brailleObject.setProperties({"object":"braille"});
	//オブジェクトを配列brailleにまとめる
	braille.push(brailleObject);
	//配列brailleをもとにデータソースを作成
	let brailleSource = new ol.source.Vector({
		features: braille
	});
	//レイヤにデータソースを登録
	brailleLayer.setSource(brailleSource);
	//更新
	brailleLayer.getSource().changed();
}

//方向機能
function directionMarkerSet(coordinate){
	let directionMarkerCoordinates = [//北の矢印を一筆書き（XY座標で次に線を結ぶ点を指定する）
		coordinate[0]   ,coordinate[1]   ,//（0,0）
		coordinate[0]   ,coordinate[1]-75,//（0,-75）
		coordinate[0]   ,coordinate[1]+75,//（0,75)
		coordinate[0]-75,coordinate[1]   ,//(-75,0)
		coordinate[0]   ,coordinate[1]+75,//(0,75)
		coordinate[0]+75,coordinate[1]   ,//(75,0)これを順に結ぶと矢印となる（75はズームレベル16で見やすいサイズとして決めた）
	];
	//一筆書きした方位記号を線として登録
	let directionMarkerGeometry= new ol.geom.LineString(directionMarkerCoordinates,"XY");
	//ズームレベルに合わせてサイズを調整
	let zoomScale=Math.pow(2,(16-map.getView().getZoom()));//ズームレベル16を基準にしたため16から引く（ズームレベル1減ると地図は2倍）
	directionMarkerGeometry.scale(zoomScale);//矢印の大きさをズームレベルに応じて大きくする
	//方位記号のオブジェクトを作成
	let directionMarkerObject = new ol.Feature({
		geometry: directionMarkerGeometry
	});
	//オブジェクトにプロパティを追加
	directionMarkerObject.setProperties({"object":"direction"});
	//配列directionに格納するが、すでにほかの方位記号オブジェクトがあったらすべて削除する
	if(direction!=null){
		direction=[];
	}
	direction.push(directionMarkerObject);
	//方位記号オブジェクトをもとにデータソースを作成
	let directionSource = new ol.source.Vector({
		features: direction
	});
	//レイヤにデータソースを登録
	directionLayer.setSource(directionSource);
	//更新
	directionLayer.getSource().changed();
}

//削除機能
function deleteMarker(features){
	if(!!features){//削除する対象が本当にあるならば
		let feature=features[0];//そのうちの初めの１つのみを選択する
		//削除するオブジェクトが
		//触地図の地物なら
		if(["Positions","Point","MultiPoint","LineString","MultiLineString","Polygon","MyltiPolygon"].indexOf(feature.type_)>=0){
			let fid = feature.id_;//地物のidを取得
			deleteObject[fid] = feature;//削除するオブジェクトがまとめられた配列deleteObjectに格納
			//すべての触地図レイヤを更新
			for(id in Layers.tactile.mapbox){
				Layers.tactile.mapbox[id].setStyle(Layers.tactile.mapbox[id].getStyle());
			}
			return;
		}
		//マーカーなら
		if(feature.values_.object==="marker"){
			let markerId = feature.ol_uid;//マーカー固有のidを取得
			let deleteMarkerId;
			for(key in marker){//表示しているマーカーの中で
				if(marker[key].ol_uid===markerId){//削除したいマーカーがいたならば
					deleteMarkerId=key;//表示しているマーカーのうち何番目なのかを控える
				}
			}
			marker.splice(deleteMarkerId,1);//配列から削除するマーカーのみ削除
			//削除後に残されたマーカーをデータソースとし更新
			let markerSource = new ol.source.Vector({
				features: marker
			});
			markerLayer.setSource(markerSource);
			markerLayer.getSource().changed();
			return;
		}
		//方位記号なら(マーカーと挙動は一緒なので省略)
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
		//点字記号なら（省略）
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
		//線なら
		if(feature.geometryName_==="drawLine"){
			//ラインソースから削除し更新
			lineSource.removeFeature(feature);
			lineSource.changed();
			return;
		}
	}
}

//削除機能時にダブルクリックで復元する機能
function redoSelectedFeature(){
	let keys_array = Object.keys(deleteObject);//オブジェクトのキーだけを抽出した配列を作成
	let len =  keys_array.length;//長さを取得
	delete deleteObject[keys_array[len-1]];//連想配列の末尾を削除
	//更新
	for(id in Layers.tactile.mapbox){
		Layers.tactile.mapbox[id].setStyle(Layers.tactile.mapbox[id].getStyle());
	}
}