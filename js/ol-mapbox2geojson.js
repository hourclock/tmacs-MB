function mapbox2geojson(array){
	let temp_json = new String;
	let cnt = 0;
	temp_json+='{ "type": "FeatureCollection","features": [';
	array.forEach(
		function(feature,index){
			if(feature.type_=="Polygon"){//-----------------------------------------------------------------------------------------------
				if(cnt!=0){
				temp_json+=",";
				}
				temp_json+='{"type": "Feature","geometry": {'
				+ '"type": "Polygon","coordinates": [';
				for (var i = 0;i<(feature.flatCoordinates_.length)/2; i++) {
					let point=ol.proj.transform([feature.flatCoordinates_[i*2],feature.flatCoordinates_[i*2+1]],"EPSG:3857","EPSG:4326");
					if(i!=0){
						temp_json+=","
					}
					temp_json+='['+point[0]+','+point[1]+']';
				}
				temp_json+=']},'+
				'"properties": {';
				if(feature.properties_.class!=undefined){
					temp_json+='"class":"'+feature.properties_.class;
				}else{
					temp_json+='"class":"';
				}
				if(feature.properties_.type!=undefined){
					temp_json+='","type":"'+feature.properties_.type;
				}
				if(feature.properties_.layer!=undefined){
					temp_json+='","layer":"'+feature.properties_.layer;
				}
				temp_json+='"}}';
				cnt++;
			}
			else if(feature.type_=="MultiLineString"){//----------------------------
				if(cnt!=0){
					temp_json+=",";
				}
				temp_json+='{"type": "Feature","geometry": {"type": ';
					temp_json+='"MultiLineString","coordinates": [';
					let end_cnt=0;
					let end_num=0;
					for (var i = 0;i<(feature.flatCoordinates_.length)/2; i++) {
						let point=ol.proj.transform([feature.flatCoordinates_[i*2],feature.flatCoordinates_[i*2+1]],"EPSG:3857","EPSG:4326");
						if(end_num!=0&&end_cnt==0){
							temp_json+=",";
						}
						if(end_cnt==0){
							temp_json+="[";
						}
						if(end_cnt<feature.ends_[end_num]/2){
							if(end_cnt!=0){
								temp_json+=",";
							}
							temp_json+='['+point[0]+','+point[1]+']';
						}
						end_cnt++;
						if(end_num!=0){
							if(end_cnt==(feature.ends_[end_num]-feature.ends_[end_num-1])/2){
								temp_json+="]";
								end_cnt=0;
								end_num++;
							}
						}else{
							if(end_cnt==feature.ends_[end_num]/2){
								temp_json+="]";
								end_cnt=0;
								end_num++;
							}
						}
					}
					temp_json+="]";
				temp_json+='},'+
				'"properties": {';
				if(feature.properties_.class!=undefined){
					temp_json+='"class":"'+feature.properties_.class;
				}else{
					temp_json+='"class":"';
				}
				if(feature.properties_.type!=undefined){
					temp_json+='","type":"'+feature.properties_.type;
				}
				if(feature.properties_.layer!=undefined){
					temp_json+='","layer":"'+feature.properties_.layer;
				}
				if(feature.properties_.oneway!=undefined){
					temp_json+='","oneway":"'+feature.properties_.oneway;
				}
				if(feature.properties_.structure!=undefined){
					temp_json+='","structure":"'+feature.properties_.structure;
				}
				temp_json+='"}}';
				cnt++;
			}
			else if(feature.type_=="LineString"){//----------------------------
				if(cnt!=0){
					temp_json+=",";
				}
				temp_json+='{"type": "Feature","geometry": {"type": ';
				temp_json+='"LineString",'+
				'"coordinates": [';
				for (var i = 0;i<(feature.flatCoordinates_.length)/2; i++) {
					let point=ol.proj.transform([feature.flatCoordinates_[i*2],feature.flatCoordinates_[i*2+1]],"EPSG:3857","EPSG:4326");
					if(i!=0){
						temp_json+=",";
					}
					temp_json+='['+point[0]+','+point[1]+']';
				}
				temp_json+="]";
				temp_json+='},'+
				'"properties": {';
				if(feature.properties_.class!=undefined){
					temp_json+='"class":"'+feature.properties_.class;
				}else{
					temp_json+='"class":"';
				}
				if(feature.properties_.type!=undefined){
					temp_json+='","type":"'+feature.properties_.type;
				}
				if(feature.properties_.layer!=undefined){
					temp_json+='","layer":"'+feature.properties_.layer;
				}
				if(feature.properties_.oneway!=undefined){
					temp_json+='","oneway":"'+feature.properties_.oneway;
				}
				if(feature.properties_.structure!=undefined){
					temp_json+='","structure":"'+feature.properties_.structure;
				}
				temp_json+='"}}';
				cnt++;
			}
			else if(feature.type_=="MultiPoint"){//----------------------------
				if(cnt!=0){
					temp_json+=",";
				}
				temp_json+='{"type": "Feature","geometry": {"type": ';
				temp_json+='"MultiPoint","coordinates": [';
				for (var i = 0;i<(feature.flatCoordinates_.length)/2; i++) {
					let point=ol.proj.transform([feature.flatCoordinates_[i*2],feature.flatCoordinates_[i*2+1]],"EPSG:3857","EPSG:4326");
					if(i!=0){
						temp_json+=",";
					}
					temp_json+='['+point[0]+','+point[1]+']';
				}
				temp_json+="]";
				temp_json+='},'+
				'"properties": {';
				if(feature.properties_.class!=undefined){
					temp_json+='"class":"'+feature.properties_.class;
				}else{
					temp_json+='"class":"';
				}
				if(feature.properties_.type!=undefined){
					temp_json+='","type":"'+feature.properties_.type;
				}
				if(feature.properties_.layer!=undefined){
					temp_json+='","layer":"'+feature.properties_.layer;
				}
				if(feature.properties_.oneway!=undefined){
					temp_json+='","oneway":"'+feature.properties_.oneway;
				}
				if(feature.properties_.structure!=undefined){
					temp_json+='","structure":"'+feature.properties_.structure;
				}
				temp_json+='"}}';
				cnt++;
			}

			else if(feature.type_=="Point"){
				if(cnt!=0){
					temp_json+=",";
				}
				temp_json+='{"type": "Feature","geometry": {'
				+ '"type": ';
				temp_json+='"Point","coordinates": ';
					let point=ol.proj.transform([feature.flatCoordinates_[0],feature.flatCoordinates_[1]],"EPSG:3857","EPSG:4326");
					temp_json+='['+point[0]+','+point[1]+']';
				temp_json+='},'+
				'"properties": {';
				if(feature.properties_.class!=undefined){
					temp_json+='"class":"'+feature.properties_.class;
				}else{
					temp_json+='"class":"';
				}
				if(feature.properties_.type!=undefined){
					temp_json+='","type":"'+feature.properties_.type;
				}
				if(feature.properties_.layer!=undefined){
					temp_json+='","layer":"'+feature.properties_.layer;
				}
				if(feature.properties_.ldir!=undefined){
					temp_json+='","ldir":"'+feature.properties_.ldir;
				}
				if(feature.properties_.localrank!=undefined){
					temp_json+='","localrank":"'+feature.properties_.localrank;
				}
				if(feature.properties_.name!=undefined){
					temp_json+='","name":"'+feature.properties_.name;
				}
				if(feature.properties_.name_ar!=undefined){
					temp_json+='","name_ar":"'+feature.properties_.name_ar;
				}
				if(feature.properties_.name_de!=undefined){
					temp_json+='","name_de":"'+feature.properties_.name_de;
				}
				if(feature.properties_.name_en!=undefined){
					temp_json+='","name_en":"'+feature.properties_.name_en;
				}
				if(feature.properties_.name_fr!=undefined){
					temp_json+='","name_fr":"'+feature.properties_.name_fr;
				}
				if(feature.properties_.name_ja!=undefined){
					temp_json+='","name_ja":"'+feature.properties_.name_ja;
				}
				if(feature.properties_.name_ko!=undefined){
					temp_json+='","name_ko":"'+feature.properties_.name_ko;
				}
				if(feature.properties_.name_pt!=undefined){
					temp_json+='","name_pt":"'+feature.properties_.name_pt;
				}
				if(feature.properties_.name_ru!=undefined){
					temp_json+='","name_ru":"'+feature.properties_.name_ru;
				}
				if(feature.properties_.name_zh!=undefined){
					temp_json+='","name_zh":"'+feature.properties_.name_zh;
				}
				temp_json+='"}}';
			cnt++;
			}
		}
	);
	temp_json+="]}";
	return temp_json;
}