//3. 設定パネル
$(function(){//検索が押されたら候補用のドロップダウンを表示
	let resultContainer;
	$("#addr").focus();
	$('#search button[type=button]').on("click", function(event){
		resultContainer=search(event);
	});
	$('#search input[type=text]').complete(function(event){
		resultContainer=search(event);
	});

	$(document).on("click", "#dropdown li" ,function() {
		setCenter(map,resultContainer.features[$(this).val()].center);
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

$(function() {
	$('#layer').change(function(){
		if(Status.tactile=="mapbox"){
			mapboxRoadLayer.getSource().changed();
			mapboxCreateSvg();
		}else if(Status.tactile=="gsi"){
			gsiRoadLayer.getSource().changed();
			gsiCreateSvg();
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
		gsiRoadLayer.getSource().changed();
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
			$("#svg_image").attr("xlink:href",createDataUrl())
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
		}else if( this.value=="mouri"){
			console.log("SAVE:SessionStorage");
			let width = $("#map").width();
			let height = $("#map").height();
			$("#svg_image").attr("xlink:href",createDataUrl())
						.attr("x","0")
						.attr("y","0")
						.attr("height",height)
						.attr("width",width);
			let text = $("#svg_export").html();
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