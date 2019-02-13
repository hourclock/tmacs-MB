//設定パネル
$(function(){//検索が押されたら候補用のドロップダウンを表示
	let placeOption;//検索候補を格納
	$('#search button[type=button]').on("click", function(event){//検索ボタンを押したとき
		placeOption=setSearchPosition(event);
	});
	$('#search input[type=text]').complete(function(event){//検索パネルで文字入力しエンターを押したとき
		placeOption=setSearchPosition(event);
	});

	$(document).on("click", "#dropdown li" ,function() {//検索候補をクリックしたとき
		let selectedOptionCoordinate = ol.proj.transform(placeOption.features[$(this).val()].center,"EPSG:4326", "EPSG:3857");
		map.getView().setCenter(selectedOptionCoordinate);
	});

	$('#place input[type=button]').on("click", function() {//現在位置ボタンを押したとき
		setCurrentPosition();
	});
});

//背景地図
//背景地図の切り替え
$(function() {
	$('#basemap input[type=radio]').change( function() {
		Status.back=this.value;
		layersSet();
		console.log("CHANGE BACK LAYER:"+this.value);
	});
});

//背景地図の透過率
$("input[name='opacity']").TouchSpin({
	min: 0,
	max: 100,
	step: 1,
	postfix:"%",
});
$(function() {
	$("input[name='opacity']").change(function() {
		let opacity =zenkakuToHankaku(this.value);
		$("input[name='opacity']").val(opacity);
		for(backID in Layers.back){
			Layers.back[backID].setOpacity(this.value/100);
		}

	});
});

//触地図
//触地図のon/off
$(function() {
	$("input[name='tactile']").change(function() {
		Status.tactile=( $(this).prop('checked') )?"mapbox":"none";
		if(Status.tactile==="none"){
			$(".tactileLayer").hide();
		}else{
			$(".tactileLayer").show();
		}
		layersSet();
		console.log("CHANGE TACTILE LAYER:"+this.value);
	});
});

//レイヤ
//触地図レイヤーのon/off
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
	$('#layerConfig').change(function(){
		if($("#layerConfig").prop('checked')){
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
	$("input[name='rotate']").change(function() {
		let degree=zenkakuToHankaku(this.value);
		$("input[name='rotate']").val(degree);
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
	$("input[name='scale']").on("change",function() {
		let zoom = zenkakuToHankaku(this.value);
		$("input[name='scale']").val(zoom);
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
	$("input[name='mapscale']").on("change",function() {
		let zoom = zenkakuToHankaku(this.value);
		$("input[name='mapscale']").val(zoom);
		let scale = Math.LOG2E * Math.log((96*39.37*156543.04*Math.cos(ol.proj.transform(map.getView().getCenter(),"EPSG:3857", "EPSG:4326")[1]*Math.PI/180))/zoom);
		map.getView().setZoom(scale);
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
		function setGridBorder(string){
			document.getElementById('top').style.borderBottom=string;
			document.getElementById('left').style.borderRight=string;
			document.getElementById('right').style.borderLeft=string;
			document.getElementById('bottom').style.borderTop=string;
		}
		function setGridCss(vertical,horizontal){
			$('#top,#bottom').css("background-size","calc(100%/"+horizontal+") 100%");
			$('#left,#right').css("background-size","100% calc(100%/"+vertical+")");
		}
		switch(this.value){
			case "frame-on":
				setGridBorder("1mm solid #000000");
				break;
			case "frame-off":
				setGridBorder("");
				break;
			case "2×3":
				setGridCss(2,3);
				break;
			case "3×4":
				setGridCss(3,4);
				break;
			case "4×5":
				setGridCss(4,5);
				break;
			case "5×6":
				setGridCss(5,6);
				break;
		}
	});
});
//3.8 END


$(function() {
	$('#edit').change(function() {//編集のON・OFF
		if($(this).prop('checked')){
			$("#editOption").show();
			if(Status.editMode==="line"){//もし前回の編集モードの最後がラインだったら
				map.addInteraction(draw);
			}else if(Status.editMode==="braille"){
				$("#braille-text").show();
				$("#braille-sumiji").show();
			}else if(Status.editMode==="marker"){
				$("#markerOption").show();
			}
		}else{//それ以外ではラインモードを取り消しておく
			map.removeInteraction(draw);
			$("#editOption").hide();
			$("#braille-text").hide();
			$("#braille-sumiji").hide();
			$("#markerOption").hide();
		}
	});

	$('#editOption input[type=radio]').change(function() {//編集のボタンを押したとき動作
		Status.editMode=this.value;
		if(Status.editMode==="line"){
			map.addInteraction(draw);
		}else {
			map.removeInteraction(draw);
		}
		if(Status.editMode==="braille"){
			$("#braille-text").show();
			$("#braille-sumiji").show();
		}else{
			$("#braille-text").hide();
			$("#braille-sumiji").hide();
		};
		if(Status.editMode==="marker"){
			$("#markerOption").show();
		}else{
			$("#markerOption").hide();
		};
	});

	$("#markerOption input[type=radio]").change(function(){
		Status.markerMode=this.value;
	});
});

//編集機能（あとで関数か整理すること）
map.on('dblclick', function(event) {//ダブルクリック（削除機能における戻る機能）
	if($("#edit").prop("checked")){
		if(Status.editMode==="delete"){
			redoSelectedFeature();
		}
	}
});

map.on("singleclick",function(event){
	if($("#edit").prop("checked")){//編集機能中のクリック
		let features = map.getFeaturesAtPixel(event.pixel);
		let coordinate=event.coordinate;
		switch(Status.editMode){
			case "marker":
				landmarkMarkerSet(coordinate);
				break;
			case "braille":
				brailleMarkerSet(coordinate);
				break;
			case "direction":
				directionMarkerSet(coordinate);
				break;
			case "delete":
				deleteMarker(features);
				break;
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
			window.print();
		//PNG出力
		}else if( this.value === "png" ){
			map.render();
			let canvas = map.renderer_.context_.canvas;//canvasを取得
			let fileName="触地図";
			if(!!$('#search input').val()){
				fileName=$('#search input').val();
			}
			//ブラウザごとに保存動作
			if (navigator.msSaveBlob) {
				navigator.msSaveBlob(canvas.msToBlob(), fileName+'.png');
			}else{
				canvas.toBlob(
					function(blob) {
						saveAs(blob, fileName+'.png');
					}
				);
			}
		}
	});
});
//3.9 END
