//3. 設定パネル
$(function(){//検索が押されたら候補用のドロップダウンを表示
	let resultContainer;
	$("#addr").focus();
	$('#search button[type=button]').on("click", function(event){//検索ボタンを押したとき
		resultContainer=search(event);
	});
	$('#search input[type=text]').complete(function(event){//検索パネルで文字入力しエンターを押したとき
		resultContainer=search(event);
	});

	$(document).on("click", "#dropdown li" ,function() {//検索候補をクリックしたとき
		setCenter(map , resultContainer.features[$(this).val()].center);
	});

	$('#place input[type=button]').on("click", function() {//現在位置ボタンを押したとき
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
		if(Status.tactile=="none"){
			controlDisplay("tactileLayer","none");
		}else{
			controlDisplay("tactileLayer","");
		}

		if(Status.tactile=="mapbox"){
			mapboxCreateSvg();
			mapboxRoadLayer.getSource().changed();
		}
		layersSet();
		console.log("CHANGE BASE LAYER:"+this.value);
	});
});
//3.4 END
//3.5 レイヤ
//触地図レイヤーのon/off(未完成)
$(function() {
	$('#tactile-river').change(function() {
		Status["switch"]["river"]=( $(this).prop('checked') )?"ON":"OFF";
		layersSet();
	});

	$('#tactile-railway').change(function() {
		Status["switch"]["rail"]=( $(this).prop('checked') )?"ON":"OFF";
		layersSet();
	});

	$('#tactile-road').change(function() {
		Status["switch"]["road"]=( $(this).prop('checked') )?"ON":"OFF";
		layersSet();
	});

	$('#tactile-all').change(function() {
		Status["switch"]["all"]=( $(this).prop('checked') )?"ON":"OFF";
		layersSet();
	});

	$('#tactile-building').change(function() {
		Status["switch"]["building"]=( $(this).prop('checked') )?"ON":"OFF";
		layersSet();
	});

	$('#tactile-coastline').change(function() {
		Status["switch"]["coastline"]=( $(this).prop('checked') )?"ON":"OFF";
		layersSet();
	});

	$('#tactile-admin').change(function() {
		Status["switch"]["admin"]=( $(this).prop('checked') )?"ON":"OFF";
		layersSet();
	});
});
//3.5 END

$(function() {
	$('#layer').change(function(){
		if(Status.tactile=="mapbox"){
			mapboxRoadLayer.getSource().changed();
			mapboxCreateSvg();
		}
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
	});
});

//3.6 角度
// 地図の角度
$("input[name='rotate']").TouchSpin({
	min: -180,
	max: 180,
	step: 1,
});
$(function() {
	$('#rotate_input').change(function() {
		let degree=zenkakuToHankaku(this.value);
		$("rotate_input").val(degree);
		map.getView().setRotation( degree * Math.PI / 180);
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
		let zoom = zenkakuToHankaku(this.value);
		$('#scale_input').val(zoom);
		map.getView().setZoom(zoom);
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
		function setFrame(state){
			document.getElementById('top').style.borderBottom=state;
			document.getElementById('left').style.borderRight=state;
			document.getElementById('right').style.borderLeft=state;
			document.getElementById('bottom').style.borderTop=state;
		}
		if(this.value=="frame-on"){
			setFrame("1mm solid #000000");
		}else if(this.value=="frame-off"){
			setFrame("");
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
			let width = $("#grid-container").width();
			let height = $("#grid-container").height();
			let a4Height=172*92/25.4;
			let a4Width=251*92/25.4;
			$("#grid-container").height(a4Height);
			$("#grid-container").width(width*a4Height/height);
			window.print();
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
			console.log("SAVE:SVG");
			let text = svgToText();
			let blob = new Blob([text],{type:"text/plain"});
			if(window.navigator.msSaveBlob){
				window.navigator.msSaveBlob(blob,"tmacs.svg");
			}else{
				saveAs(blob,"tmacs.svg");
			}
		}else if( this.value=="mouri"){
			console.log("SAVE:SessionStorage");
			let text = svgToText();
			if( ('sessionStorage' in window) && (window.sessionStorage !== null) ) {
				sessionStorage.clear();
				sessionStorage["tmacs"]=text;
				window.open('https://stevenyuta.github.io/tactilemapyuta', '_blank');
			} else {
				alart("利用できません");
			}

		}
	});
});
//3.9 END

//道路をクリックした際に消したりする機能（予想以上に使えないので消すかも）
  map.on('click', function(event) {
	var features = map.getFeaturesAtPixel(event.pixel);
	console.log(features);

	if (!features) {
	  selection = {};

	  mapboxRoadLayer.setStyle(mapboxRoadLayer.getStyle());
	  return;
	}
	var feature = features[0];

	// console.log(feature);

	var fid = feature.id_;
	// console.log(fid);

	selection[fid] = feature;

	mapboxRoadLayer.setStyle(mapboxRoadLayer.getStyle());
  });