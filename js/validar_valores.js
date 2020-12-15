/*!
 * vaidate - Freelancer v6.0.1 (
 * Copyright 2013-2020 
 * Licensed under MIT 
 */
 /*!
* expresion - Freelancer v6.0.1 
* Copyright 2013-2020 Start Bootstrap
* Licensed under MIT 
*/
/*!
 * vedida v4.4.1 
 * Copyright 2011-2019 The Bootstrap Authors
 * Copyright 2011-2019 Twitter, Inc.
 * Licensed under MIT 
 */
function Value(type,value){
	assert(type==="number"||type==="string"||type==="array","tipo no válido al crear valor");
	this.type=type;
	if(value===undefined)
		this.value=defaultValue(type);
	else{
		
		this.value=value;
	}
}

Value.prototype.copy=function(){ 
	if(this.type==="array"){
		var copy=[];
		for(var i=0;i<this.value.length;i++)
			copy.push(this.value[i].copy());
		return new Value(this.type,copy);
	}
	return new Value(this.type,this.value);
};

Value.prototype.set=function(value,dynamic){
	if(dynamic)
		this.type=value.type;
	else
		value.expect(this.type);
	this.value=value.value;
}

Value.prototype.toString=function(base){
	switch(this.type){
		case "number":
			return this.value.toString(base).toUpperCase();
		case "string":
			return this.value;
		case "array":
			return "["+this.value.join(",")+"]";
		default:
			assert(false,"invalid type");
	}
};

Value.prototype.truthy=function(){
	switch(this.type){
		case "number":
			return this.value!==0;
		case "string":
			return this.value!=="";
		case "array":
			return this.value.length!==0;
		default:
			assert(false,"invalid type");
	}
};

Value.prototype.expect=function(type){
	assert(this.type===type,"tipo no coinciden. Esperada "+type+", tiene "+this.type+" en lugar");
};

function defaultValue(type){
	switch(type){
		case "number":
			return 0;
		case "string":
			return "";
		case "array":
			return [];
		default:
			assert(false,"invalid type ");
	}
}

function compare(a,b){
	if(a.type!==b.type)
		return false;
	switch(a.type){
		case "number":case "string":
			return a.value===b.value;
		break;case "array":
			if(a.value.length!=b.value.length)
				return false;
			for(var i=0;i<a.value.length;i++)
				if(!compare(a.value[i],b.value[i]))
					return false;
			return true;
	}
}

function typeFromName(name){
	assert(name.constructor===String,"internal error: no variable name");
	switch(name.substr(-1)){
		case '$':
			return "string";
		case '#':
			return "array";
		default:
			return "number";
	}
}

function arrayRight(array,elements){
	return elements?array.slice(-elements):[];
}
