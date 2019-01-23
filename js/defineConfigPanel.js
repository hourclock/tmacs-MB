//3. 設定パネル
$(function(){//検索が押されたら候補用のドロップダウンを表示
	let placeOption;//検索候補を格納
	$("#addr").focus();
	$('#search button[type=button]').on("click", function(event){//検索ボタンを押したとき
		placeOption=setSearchPosition(event);
	});
	$('#search input[type=text]').complete(function(event){//検索パネルで文字入力しエンターを押したとき
		placeOption=setSearchPosition(event);
	});

	$(document).on("click", "#dropdown li" ,function() {//検索候補をクリックしたとき
		let selectedOptionCoordinate = transform(placeOption.features[$(this).val()].center);
		map.getView().setCenter(selectedOptionCoordinate);
	});

	$('#place input[type=button]').on("click", function() {//現在位置ボタンを押したとき
		setCurrentPosition();
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
		let opacity =zenkakuToHankaku(this.value);
		$('#opacity_input').val(opacity);
		for(backID in Layers.back){
			Layers.back[backID].setOpacity(this.value/100);
		}

	});
});
//3.3 END
//3.4 触地図
//触地図のon/off
$(function() {
	$('#tactile').change(function() {
		Status.tactile=( $(this).prop('checked') )?"mapbox":"none";
		if(Status.tactile==="none"){
			$(".tactileLayer").hide();
		}else{
			$(".tactileLayer").show();
		}

		// if(Status.tactile=="mapbox"){
		// 	mapboxRoadLayer.getSource().changed();
		// }
		layersSet();
		console.log("CHANGE BASE LAYER:"+this.value);
	});
});
//3.4 END
//3.5 レイヤ
//触地図レイヤーのon/off(未完成)
$(function() {
	$("#tactileLayer input").change(function(){
		Status.switch[this.value]=( $(this).prop('checked') )?true:false;
		if(this.value==="road"){
			if($(this).prop('checked')){
				$(".roadContents").show();
			}else{
				$(".roadContents").hide();
			}
		}
		layersSet();
	})
});
//3.5 END
//道路表示内容選択機能
$(function() {
	$('#layer').change(function(){
		if(Status.tactile==="mapbox"){
			mapboxRoadLayer.getSource().changed();
		}
	});
});
//マルチセレクト機能の有効化・無効化
$(function() {
	$('.layerconfig').change(function(){
		if($(".layerconfig").prop('checked')){
			$("#layer").multiselect("enable");
		}else{
			$("#layer").multiselect("disable");
		}
		mapboxRoadLayer.getSource().changed();
	});
});

//3.6 角度
// 地図の角度
$("input[name='rotate']").TouchSpin({
	min: -180,
	max: 180,
	step: 1,
	postfix:"度"
});
$(function() {
	$('#rotate_input').change(function() {
		let degree=zenkakuToHankaku(this.value);
		$("rotate_input").val(degree);
		map.getView().setRotation( degree * Math.PI / 180);
	});
});
//3.6 END
//3.7 ズームレベル
// ズームレベルの切り替え
$("input[name='scale']").TouchSpin({
	step: 0.1,
	decimals:1,
});
$(function() {
	$('#scale_input').on("change",function() {
		let zoom = zenkakuToHankaku(this.value);
		$('#scale_input').val(zoom);
		map.getView().setZoom(zoom);
	});
});
//3.7 END
// 縮尺の切り替え
$("input[name='mapscale']").TouchSpin({
	max:500000000,
	step: 10,
	decimals:1,
	prefix: '1/'
});
$(function() {
	$('#mapScale_input').on("change",function() {
		let zoom = zenkakuToHankaku(this.value);
		$('#mapScale_input').val(zoom);
		let scale = Math.LOG2E * Math.log((96*39.37*156543.04*Math.cos(ol.proj.transform(map.getView().getCenter(),"EPSG:3857", "EPSG:4326")[1]*Math.PI/180))/zoom);
		map.getView().setZoom(scale);
		// $('#scale_input').val(scale);
	});
});
//3.8 目盛り
//目盛りの表示・非表示
$(function() {
	$('#append-check').change(function() {
		if( !$(this).prop('checked')){
			$(".gridDisplay").hide();
			console.log("Append OFF");
		}else{
			$(".gridDisplay").show();
			console.log("Append ON");
		}
	});
});

//目盛り変更
$(function() {
	$('#grid input[type=button]').change(function(){
		function setFrame(state){
			document.getElementById('top').style.borderBottom=state;
			document.getElementById('left').style.borderRight=state;
			document.getElementById('right').style.borderLeft=state;
			document.getElementById('bottom').style.borderTop=state;
		}
		if(this.value==="frame-on"){
			setFrame("1mm solid #000000");
		}else if(this.value==="frame-off"){
			setFrame("");
		}else{
			$('#top,#bottom').css("background-size","calc(100%/"+String(Number(this.value)+1)+") 100%");
			$('#left,#right').css("background-size","100% calc(100%/"+this.value+")");
		}
	});
});
//3.8 END


$(function() {
	$('#edit').change(function() {//編集のON・OFF
		if($(this).prop('checked')){
			if(editMode==="line"){//もし直前の編集モードがラインだったら継続してラインになるように
				map.addInteraction(draw);
			}else if(editMode==="braille"){
				$("#tactile-text").show();
				$("#tactile-sumiji").show();
			}
			$("#edit-contents").show();
		}else{//それ以外ではラインモードを取り消しておく
			$("#edit-contents").hide();
			map.removeInteraction(draw);
			$("#tactile-text").hide();
			$("#tactile-sumiji").hide();
		}
	});

	$('#edit-contents input[type=radio]').change(function() {//編集のボタンを押したとき動作
		editMode=this.value;
		if(editMode==="line"){
			map.addInteraction(draw);
		}else {
			map.removeInteraction(draw);
		}
		if(editMode==="braille"){
			$("#tactile-text").show();
			$("#tactile-sumiji").show();
		}else{
			$("#tactile-text").hide();
			$("#tactile-sumiji").hide();
		}
	});
});

//編集機能（あとで関数か整理すること）
map.on('dblclick', function(event) {//ダブルクリック（削除機能における戻る機能）
	if($("#edit").prop("checked")){
		if(editMode==="delete"){
			redoSelectedFeature();
		}
	}
});

map.on("singleclick",function(event){
	if($("#edit").prop("checked")){//編集機能中のクリック
		let features = map.getFeaturesAtPixel(event.pixel);
		let coordinate=event.coordinate;
		if(editMode==="marker"){
			landmarkMarkerSet(coordinate);
		}else if(editMode==="braille"){
			brailleMarkerSet(coordinate);
		}else if(editMode==="direction"){
			directionMarkerSet(coordinate);
		}else if(editMode==="delete"){
			deleteMarker(features);
		}
	}else{
		let information = map.getFeaturesAtPixel(event.pixel);
		if(information!=null){
			console.log(information[0]);
		}
	}
});


//3.9 保存
$(function(){
	$('#output input[type=button]').change(function(){
		//プリント
		if( this.value === "print" ){
			console.log("SAVE:PRINT");
			let width = $("#grid-container").width();
			let height = $("#grid-container").height();
			let a4Height=172*92/25.4;
			let a4Width=251*92/25.4;
			$("#grid-container").height(a4Height);
			$("#grid-container").width(width*a4Height/height);
			window.print();
		//PNG出力
		}else if( this.value === "png" ){
			map.render();
			let canvas = map.renderer_.context_.canvas;//canvasを取得
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
	});
});
//3.9 END
