function parse(nextToken){
	
	var type,word;
	
	var newType,newWord;
	
	var readNext=1;
	
	var defs={};
	
	var noEquals,noTo;
	
	var current={};
	var currentBlocks=[];
	var globals={};
	var variables=globals;
	
	
	function startBlock(){
		current.code=[];
		current.line=lineNumber;
		currentBlocks.push(current);
		current={};
	}
	
	function endBlock(){
		var block=currentBlocks.pop();
		currentBlocks[currentBlocks.length-1].code.push(block);
	}
	
	function endDef(){
		var block=currentBlocks.pop();
		defs[block.name]=block;
	}
	
	
	var ifThisLine=false,codeAfterThen;
	
	var expr=[];
	
	current.type="main";
	startBlock();
	
	
	do{
		try{
			readStatement();
		}catch(error){
			if(error.name==="ParseError")
				return error.message+" on line "+lineNumber;
			
			else{
				throw error;
			}
		}
	}while(type!=="eof");;;
	
	
	function readStatement(){
		next();
		if(type!="comment" && ifThisLine && type!="linebreak")
			codeAfterThen=true;
		switch(type){
			
			case "SWIT":
				current.type="SWIT";
				assert(current.condition=readExpression(),"Falta el argumento de la palabra clave");
				startBlock();
			break;case "CASO":
				var currentType=currentBlock().type;
				if(currentType==="CASO")
					
					endBlock();
				else
					
					assert(currentType==="SWIT","CASO inválido");
				
				current.type="CASO";
				assert(current.conditions=readList(readExpression),"Falta el argumento de la palabra clave");
				startBlock();
			break;case "FNSW":
				assert(currentBlock().type==="CASO","FNSW sin SWIT/CASO");
				endBlock();
				endBlock();
			
			break;case "HAGA":
				current.type="HAGA";
				startBlock();
			break;case "HAGA":
				assert(currentBlock().type=="HAGA","HAGA sin HASTAQUE");
				assert(currentBlock().condition=readExpression(),"desaparecida HAGA condicion");
				endBlock();
			
			break;case "CUANDO":
				current.type="CUANDO";
				assert(current.condition=readExpression(),"desaparecida CUANDO condicion");
				assert(readToken("HACER"),"CUANDO sin HACER");
				startBlock();
				ifThisLine=true;
				codeAfterThen=false;
			break;case "TALVEZ":
				assert(currentBlock().type=="CUANDO"||currentBlock().type=="TALVEZ","TALVEZ sin CUANDO");
				endBlock();
				current.type="TALVEZ";
				current.condition=readExpression();
				assert(readToken("HACER"),"TALVEZ sin HACER");
				startBlock();
			break;case "CUANDONO":
				var currentType=currentBlock().type;
				
				if(currentType==="CASO"){
					
					endBlock();
					
					current.type="CASO";
					startBlock();
				
				}else{
					assert(currentBlock().type==="CUANDO"||currentBlock().type==="TALVEZ","CUANDONO sin CUANDO");
					
					endBlock();
					
					current.type="CUANDONO";
					startBlock();
				}
			break;case "FNCUANDO":
				var currentType=currentBlock().type;
				assert(currentType==="CUANDO" || currentType==="TALVEZ" || currentType==="CUANDONO","FNCUANDO sin CUANDO");
				endBlock();
				ifThisLine=false;
			
			break;case "CICLOPARA":
				current.type="CICLOPARA";
				noEquals=true;
				assert(current.variable=readExpression(),"desaparecida CICLOPARA condicion");
				noEquals=false;
				console.log(type,word)
				assert(readToken("="),"desaparecida = en CICLOPARA");
				noTo=true;
				current.start=readExpression();
				noTo=false;
				assert(readToken("HASTA"),"desaparecida TO en CICLOPARA");
				current.end=readExpression();
				if(readToken("word") && word==="STEP")
					current.step=readExpression();
				else
					readNext=0; 
				startBlock();
			break;case "FNCICLOPARA":
				assert(currentBlock().type=="CICLOPARA","FNCICLOPARA sin CICLOPARA");
				readExpression();
				endBlock();
			
			break;case "CICLOMIENTRAS":
				current.type="CICLOMIENTRAS";
				assert(current.condition=readExpression(),"Falta el argumento de la palabra clave");
				startBlock();
			break;case "FNCICLOMIENTRAS":
				assert(currentBlock().type=="CICLOMIENTRAS","FNCICLOMIENTRAS sin CICLOMIENTRAS");
				endBlock();
			
			break;case "DO":
				current.type="DO";
				startBlock();
			break;case "LOOP":
				assert(currentBlock().type=="DO","LOOP without DO");
				endBlock();
			
			break;case "FNCASO":
				current.type="FNCASO";
				current.levels=readExpression();
			break;case "CONTINUE":
				current.type="CONTINUE";
			
			break;case "FUNC":
				current.type="FUNC";
				assert(readToken("word"),"nombre de función faltante");
				current.name=word;
				
				current.inputs=readList(readDeclaration);
				startBlock();
			break;case "ENDFUNC":
				assert(currentBlock().type==="FUNC","ENDFUNC without FUNC");
				
				endDef();
			break;case "RETURN":
				current.type="RETURN";
				current.value=readExpression();
			break;case "IMPRIMIR":
				current.type="IMPRIMIR";
				current.value=readList(readExpression);
			
			break;case "comment":case ":":
			
			break;case "eof":case "linebreak":
				if(ifThisLine){
					ifThisLine=false;
					if(codeAfterThen){
						endBlock();
						console.log("terminó una sola línea CUANDO");
					}
				}
			break;default:
				readNext--;
				assert(current.value=readExpression(),"no expr esperada");
				current.type="expression";
		}
		if(current.type){
			current.line=lineNumber;
			currentBlocks[currentBlocks.length-1].code.push(current);
			current={};
		}
	}
	
	function readDeclaration(){
		if(readToken("word")){
			var x=(variables[word] || (variables[word]=new Value(typeFromName(word))));
			return x;
		}else
			return false;
	}
	

	function readVariable(){
		next();
		var name=word;
		var variable=(variables[name] || (variables[name]=new Value(typeFromName(name))));
		return {name:name,variable:variable};
	}
	
	function currentBlock(){
		return currentBlocks[currentBlocks.length-1];
	}
	
	
	function readToken(wantedType){
		next();
		if(type===wantedType){
			readNext=1;
			return true;
		}
		readNext=0;
		return false;
	}
	
	
	function readList(reader){
		var ret=[];
		var x=reader();
		if(x)
			ret.push(x);
		if(readToken(",","")){
			assert(x,"Valor Null no permitido");
			do
				assert(ret.push(reader()),"Valor Null no permitido");
			while(readToken(","));;;
		}
		return ret;
	}
	
	function readList2(reader){
		var ret=[];
		var x=reader();
		if(x)
			ret.push(x);
		if(readToken(",","")&&expr.push({type:"comma"})){
			assert(x,"Valor Null no permitido");
			do
				assert(ret.push(reader()),"Valor Null no permitido");
			while(readToken(",")&&expr.push({type:"comma"}));;;
		}
		return ret;
	}
	
	
	function readExpression(){
		expr=[];
		
		if(readExpression2())
			return rpnFromExpr(expr);
		return false;
	}
	
	function prec(token){
		if(token.type==="unary" || token.type==="comma")
			return Infinity;
		else
			switch(token.name){
				
				case "^":
					return 11;
				case "*":case "/": case "\\": case "%":
					return 10;
				case "+":case "-":
					return 9;
				case "<<":case ">>":
					return 8;
				
				case "HASTA":case "HASTAQUE":
					return 7.5;
				case "STEP":
					return 7.25;
					
				case "<":case "<=":case ">":case ">=":
					return 7;
				case "==":case "!=":
					return 6;
				case "&":
					return 5;
				case "~":
					return 4;
				case "|":
					return 3;
				case "AND":
					return 2;
				case "XOR":
					return 1;
				case "OR":
					return 0;
				case "=":
					return -1; 
			}
		assert(false,"error prec "+token.name);
	}
	
	
	function left(token){
		return 0;
	}
	
	function rpnFromExpr(expr){
		var rpn=[],stack=[];
		for(var i=0;i<expr.length;i++){
			var token=expr[i];
			switch(token.type){
				case "number":case "string":case "variable":case "function":case "array":case "index": 
					rpn.push(token);
				break;case "operator":case "unary":case "=":
					while(stack.length){
						var top=stack[stack.length-1];
						if(top.type!="("&&(prec(top)>=prec(token) || (prec(top)==prec(token) && left(token)))){
							rpn.push(stack.pop());
						}else{
							break;
						}
					}
					stack.push(token);
				break;case "comma":
					while(stack.length){
						if(stack[stack.length-1].type!="("){
							rpn.push(stack.pop());
						}else{
							break;
						}
					}
				break;case "(":
					stack.push(token);
				break;case ")":
					while(1){
						var top=stack[stack.length-1];
						if(top.type!="(")
							rpn.push(stack.pop());
						else
							break;
					}
					stack.pop();
				break;default:
				assert(false,"error typ "+token.type);
			}
		}
		while(stack.length)
			rpn.push(stack.pop());
		return rpn;
	}
	
	function readExpression2(){
		next();
		switch(type){
			
			case "word":
				var name=word;
				if(readToken("(")){
					expr.push({type:"("}); 
					var x=readList2(readExpression2);
					assert(readToken(")"),"Desaparecida \")\" en llamada de función");
					expr.push({type:")"});
					expr.push({type:"function",name:name,args:x.length});
				}else{
					var x=(variables[name] || (variables[name]=new Value(typeFromName(name))));
					expr.push({type:"variable",variable:x});
				}
			
			break;case "number":
				expr.push({type:"number",value:word});
			
			break;case "string":
				expr.push({type:"string",value:word});
			
			break;case "unary":case "minus":case "xor":
				
				expr.push({type:"unary",name:word,args:1});
				
				assert(readExpression2(),"Falta el argumento del operador");
				
				
			
			break;case "(":
				expr.push({type:"("});
				readExpression2();
				assert(readToken(")"),"Desaparecida \")\"");
				expr.push({type:")"});
			break;case "[": 
				expr.push({type:"("});
				var x=readList2(readExpression2);
				
				assert(readToken("}")||readToken("]"),"Desaparecida \"]\"");
				expr.push({type:")"});
				expr.push({type:"array",args:x.length});
			
			break;default:
				readNext=0;
				return false;
		}
		
		while(1)
			if(readToken("[")){
				expr.push({type:"("});
				assert(readExpression2(),"Desaparecida index");
				assert(readToken("]"),"Desaparecida \"]\"");
				expr.push({type:")"});
				expr.push({type:"index",args:"2"});
			}else if(readToken("dot")){
				assert(readToken("word"),"Función de falta de punto");
				var name=word;
				assert(readToken("("),"Función de falta de punto");
				expr.push({type:"("}); //all we needed!
				var x=readList2(readExpression2);
				assert(readToken(")"),"Desaparecida \")\" en llamada de función");
				expr.push({type:")"});
				expr.push({type:"function",name:name,args:x.length+1});
			}else
				break;
		
		if(readToken("operator")||readToken("minus")||readToken("xor")||(!noEquals&&readToken("="))||(!noTo&&readToken("HASTA"))){
			console.log("operator!!",word)
			expr.push({type:"operator",name:word,args:2});
			assert(readExpression2(),"Operador falta segundo argumento");
		}
		return true;
	}
	
	
	function assert(condition,message){
		if(!condition){
			
			console.log(message);
			var error=new Error(message);
			error.name="ParseError";
			throw error;
		}
	}
	
	
	function next(){
		if(readNext===1){
			var items=nextToken();
			type=items.type;
			word=items.word;
		}else if(readNext===-1){
			type=newType;
			word=newWord;
			readNext=1;
		
		}else if(readNext===-2)
			readNext=-1;
		else
			readNext=1;
	}
	
	
	if(ifThisLine){
		ifThisLine=false;
		if(codeAfterThen){
			endBlock();
			console.log("terminó una sola línea CUANDO");
		}
	}
	
	if(currentBlocks.length>1)
		return "Unclosed "+currentBlocks[1].type;
	return [currentBlocks[0],variables,defs];
}