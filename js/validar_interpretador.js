function enterpire() {
    contador_s = 45;
    carga();
    controller.processUserGuess();
    model.initGame();
    document.getElementById("resetear").style.display = "inline";
    document.getElementById("juega").style.display = "none";
}

String.prototype.replaceAt = function (index, replacement) {
    return this.substr(0, index) + replacement + this.substr(index + replacement.length);
}


function isEmpty(str) {
    return (!str || 0 === str.length);
}

{

var ip,block,ast,functions,variables,ifs,switches;
var stopped=true,interval;
var inputs=[];

var steps=1000,stepDelay=1,doVsync=false;

function run(astIn){
	ast=astIn;
	ip=[-1];
	block=[ast[0]];
	ifs=[];
	switches=[];
	functions=ast[2]; 
	variables=ast[1];
	stopped=false;
	inputs=$input.value.split("\n");
	console.log(inputs)
	stepLevel2();
}

function stepLevel2(){
	if(!stopped)
		interval=window.setInterval(stepLevel1,stepDelay);
}

function stepLevel1(){
	for(var i=0;i<steps;i++){
		step();
		if(stopped){
			break;
		}
		if(doVsync){
			doVsync=false;
			clearInterval(interval);
			window.requestAnimationFrame(stepLevel2);
			break;
		}
	}
}



function stop(error){
	if(!stopped || interval){
		stopped=true;
		if(interval){
			window.clearInterval(interval);
			interval=undefined;
		}
		
		print(error?"ERROR: "+error:"SINTAXIS VALIDA");
		print("\n");
	}
}

function enterBlock(into){
	block.push(into||current(block).code[current(ip)]);
	if(!into)
		ip[ip.length-1]++;
	ip.push(-1);
	ifs.push(0);
	switches.push(undefined);
}


function leaveBlock(){
	block.pop();
	ip.pop();
	ifs.pop();
	switches.pop();
}


function current(stack){
	return stack[stack.length-1];
}

function callFunction(name,args){
	if(builtins[name]){
		if(builtins[name][args.length]){
			return builtins[name][args.length].apply(null,args);
		}else{
			assert(builtins[name].any,"\""+name+"\" no aceptado "+args.length+" argumento");
			return builtins[name].any(args);
		}
	}else{
		assert(functions[name] && functions[name].inputs.length===args.length,"función de usuario tampoco definida");
		var x=functions[name].inputs;
		for(var i=0;i<x.length;i++){
			setVar(x[i],args[i]);
		}
		enterBlock(functions[name]);
		while(1){
			var x=step();
			if(x)
				return x;
		}
	}
}


function expr(rpn){
	
	assert(rpn.constructor===Array,"error: expresión esperada");
	var stack=[];
	for(var i=0;i<rpn.length;i++){
		
		switch(rpn[i].type){
			case "variable":
				var x=rpn[i].variable.copy()
				x.variable=rpn[i].variable;
				stack.push(x);
			break;case "number":
				stack.push(new Value("number",rpn[i].value));
			break;case "string":
				stack.push(new Value("string",rpn[i].value));
			break;case "index":
				var index=stack.pop();
				var array=stack.pop();
				index.expect("number");
				index=index.value;
				assert(index>=0 && index<array.value.length,"acceso a la matriz fuera de rango");
				var x=array.value[Math.floor(index)]
				if(array.variable)
					x.variable=array.variable.value[index];
				stack.push(x);
			break;case "operator":case "function":case "unary":
				var args=rpn[i].args;
				assert(args<=stack.length,"error: desbordamiento de pila");
				var retval;
				retval=callFunction(rpn[i].name,arrayRight(stack,args));
				for(var j=0;j<args;j++)
					stack.pop();
				stack.push(retval);
			break;case "array":
				var args=rpn[i].args;
				var array=new Value("array",arrayRight(stack,args));
				for(var j=0;j<args;j++)
					stack.pop();
				stack.push(array);
			break;default:
				assert(false,"error: token incorrecto "+rpn[i].type);
		}
	}
	
	assert(stack.length===1,"error: la pila no está vacía");
	return stack[0];
}

function print(text){
	$console.value+=text;
	$console.scrollTop=$console.scrollTopMax;
}

function jumpTo(pos){
	ip[ip.length-1]=pos;
}

function step(){
	jumpTo(current(ip)+1);
	
	while(current(ip)>=current(block).code.length){
		var now=current(block);
		switch(now.type){
			case "CICLOMIENTRAS":
				if(expr(now.condition).truthy())
					jumpTo(0);
				else
					leaveBlock();
			break;case "DO":
				jumpTo(0);
				
			break;case "HAGA":
				if(!expr(now.condition).truthy())
					jumpTo(0);
				else
					leaveBlock();
			break;case "CICLOPARA":
				var variable=expr(now.variable);
				assert(variable=variable.variable,"error: el FOR necesita una variable");
				variable.expect("number");
				if(now.step!==undefined){
					var value=expr(now.step);
					value.expect("number");
					variable.value+=value.value;
				}else
					variable.value++;
				var value=expr(now.end);
				value.expect("number");
				if(variable.value<=value.value) 
					jumpTo(0);
				else
					leaveBlock();
			break;case "main":
				stop();
				return;
			break;case "FUNC":
				leaveBlock();
				return true;
			break;case "CUANDO":case "CUANDONO":case "TALVEZ":case "CASO":case "SWIT":
				leaveBlock();
			break;default:
				throw "bad block"+now.type;
		}
	}
	var now=current(block).code[current(ip)];
	
	switch(now.type){
		case "CICLOMIENTRAS":
			if(expr(now.condition).truthy())
				enterBlock();
		break;case "DO":
			enterBlock();
		break;case "HAGA":case "FUNC":
			enterBlock();
		break;case "CICLOPARA":
			var value=expr(now.start);
			value.expect("number");
			var variable=expr(now.variable);
			assert(variable=variable.variable,"error: el FOR necesita una variable");
			variable.expect("number");
			variable.value=value.value;
			value=expr(now.end);
			value.expect("number");
			if(variable.value<=value.value);
				enterBlock();
		break;case "EXIT":
			var levels=now.levels;
			if(levels){
				levels=expr(now.levels);
				levels.expect("number");
				levels=levels.value;
				assert(levels>=1,"domain error");
			}else
				levels=1;
			while(1){
				var x=current(block);
				if(x.type==="main")
					break;
				else{
					levels--;
					if(!levels){
						leaveBlock();
						break;
					}
				}
				leaveBlock();
			}
			
		break;case "FNCASO": 
			var levels=now.levels;
			if(levels){
				levels=expr(now.levels);
				levels.expect("number");
				levels=levels.value;
				assert(levels>=1,"error de dominio");
			}else
				levels=1;
			while(1){
				var x=current(block);
				if(x.type==="main")
					break;
				else if(x.type==="CICLOPARA"||x.type==="CICLOMIENTRAS"||x.type==="HAGA"||x.type==="DO"){
					levels--;
					if(!levels){
						leaveBlock();
						break;
					}
				}
				leaveBlock();
			}
		break;case "CONTINUE":
			while(1){
				var x=current(block);
				if(x.type==="main")
					break;
				else if(x.type==="CICLOPARA"||x.type==="CICLOMIENTRAS"||x.type==="HAGA"||x.type==="DO"){
					jumpTo(Infinity);
					break;
				}
				leaveBlock();
			}
		break;case "IMPRIMIR":
			var printString="";
			for(var i=0;i<now.value.length;i++){
				printString+=(i>0?" ":"")+expr(now.value[i]).toString();
			}
			print(printString+"\n");
		break;case "expression":
			expr(now.value);
		break;case "CUANDO":
			if(expr(now.condition).truthy()){
				ifs[ifs.length-1]=true;
				enterBlock();
			}else
				ifs[ifs.length-1]=false;
		break;case "CUANDONO":
			if(!ifs[ifs.length-1])
				enterBlock();
		break;case "TALVEZ":
			if(!ifs[ifs.length-1]){
				if(expr(now.condition).truthy()){
					ifs[ifs.length-1]=true;
					enterBlock();
				}
			}
		break;case "RETURN":
			while(1){
				var x=current(block);
				leaveBlock();
				if(x.type==="FUNC")
					break;
			}
			if(now.value)
				return expr(now.value);
			return true;
		break;case "SWIT":
			var condition=expr(now.condition);
			enterBlock();
			switches[switches.length-1]=condition;
			ifs[ifs.length-1]=false;
		break;case "CASO":
			if(now.conditions){
				for(var i=0;i<now.conditions.length;i++){
					var condition=expr(now.conditions[i]);
					if(equal(switches[switches.length-1],condition).truthy()){
						ifs[ifs.length-1]=true;
						enterBlock();
						break;
					}
				}
			}else if(ifs[ifs.length-1]===false)
				enterBlock();
		break;default:
			assert(false,"instruccion no soportada "+now.type);
	}
	
}

function getNextInputValue(){
	var x=inputs.shift();
	if(x===undefined)
		return "";
	return new Value("string",x);
}


function setVar(variable,value,indexes){
	var type=variable.type;
	if(!value)
		value=defaultValue(type);
	if(indexes){
		var x=getVarFromIndexHalf(variable,indexes);
		x[0][x[1]]=value;
	}else{
		value.expect(type);
		variable.value=value.value;
	}
	return variable;
}

function assert(condition,message){
	if(!condition){
		console.log(current(block).code[current(ip)]);
		message=" On line "+current(block).code[current(ip)].line+"\n"+message;
		
		stop(message);
		console.log(message);
		var error=new Error(message);
		error.name="RunError";
		throw error;
	}
}
}