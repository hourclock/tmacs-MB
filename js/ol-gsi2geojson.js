function gsi2geojson(array){
	let temp_json = new String;
	temp_json+='{ "type": "FeatureCollection","features": [';
	array.forEach(
		function(feature,index){
			if(index!=0){
				temp_json+=",";
			}
			temp_json+='{"type": "Feature","geometry": {'+
			'"type": "LineString",'+
			'"coordinates": [';
			for (var i = 0;i<(feature.values_.geometry.flatCoordinates.length)/2; i++) {
				let point=ol.proj.transform([feature.values_.geometry.flatCoordinates[i*2],feature.values_.geometry.flatCoordinates[i*2+1]],"EPSG:3857","EPSG:4326");
				if(i!=0){
					temp_json+=","
				}
				temp_json+='['+point[0]+','+point[1]+']';
			}
			temp_json+=']},'+
			'"properties": {'+
				'"class":"'+feature.values_.class+
				'","rID":"'+feature.values_.rID+
				'","lfSpanFr":"'+feature.values_.lfSpanFr+
				'","lfSpanTo":"'+feature.values_.lfSpanTo+
				'","tmpFlg":'+feature.values_.tmpFlg+
				',"orgGILvl":"'+feature.values_.orgGILvl+
				'","ftCode":"'+feature.values_.ftCode+
				'","admCode":"'+feature.values_.admCode+
				'","devDate":"'+feature.values_.devDate+
				'","type":"'+feature.values_.type+
				'","rdCtg":"'+feature.values_.rdCtg+
				'","state":"'+feature.values_.state+
				'","lvOrder":'+feature.values_.lvOrder+
				',"name":"'+feature.values_.name+
				'","comName":"'+feature.values_.comName+
				'","admOfcRd":"'+feature.values_.admOfcRd+
				'","rnkWidth":"'+feature.values_.rnkWidth+
				'","Width":"'+feature.values_.Width+
				'","sectID":"'+feature.values_.sectID+
				'","tollSect":"'+feature.values_.tollSect+
				'","medSect":'+feature.values_.medSect+
				',"medSect":'+feature.values_.medSect+
				',"repLtdLvl":'+feature.values_.repLtdLvl+
				',"rtCode":"'+feature.values_.rtCode+
			'"}}';
		}
	);
	temp_json+="]}";
	return temp_json;
}