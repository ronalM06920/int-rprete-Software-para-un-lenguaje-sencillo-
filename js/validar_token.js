var lineNumber;

var KEYWORDS=["SWIT","CASO","FNSW", "CUANDO","HACER","CUANDONO","TALVEZ","FNCUANDO", "FUNC","RETURN","ENDFUNC", "CICLOPARA","FNCICLOPARA", "HAGA","HASTAQUE", "FNCASO","CONTINUE","VAR","IMPRIMIR", "CICLOMIENTRAS","FNCICLOMIENTRAS", "DO","LOOP"];

var constants={"#PI":Math.PI,"#VERSION":0.351};

function tokenize(code){
	var i=-1,c,isAlpha,isDigit,whitespace,prev=0;
	
	function next(){
		i++;
		c=code.charAt(i);
		
		isAlpha=(c>='A'&&c<='Z'||c>='a'&&c<='z');
		isDigit=(c>='0'&&c<='9');
		if(c==='\n')
			lineNumber++;
	}
	
	function getWord(startSkip,endSkip){
		return code.substring(startSkip!==undefined?whitespace+startSkip:whitespace,endSkip!==undefined?i-endSkip:i);
	}
	
	
	function pushWord(){
		prev=i;
		var upper=getWord().toUpperCase();
		var type;
		
		if(upper==="NOT")
			type="unary";
		
		else if(upper==="AND"||upper==="OR"||upper==="XOR"||upper==="HASTAQUE"||upper==="STEP")
			type="operator";
		else if(upper==="HASTA")
			type="HASTA";
		
		else if(upper==="TRUE"){
			type="number";
			upper=1;
		}else if(upper==="FALSE"){
			type="number";
			upper=0;
		
		}else if(KEYWORDS.indexOf(upper)!==-1)
			type=upper;
		
		else
			type="word";
		return {type:type,word:upper};
	}
	
	
	function push(type,word){
		prev=i;
		return {type:type,word:word!==undefined ? word : getWord()};
	}
	lineNumber=1;
	next();
	return function(){
		
		while(c===' '||c==='\t')
			next();
		
		if(c==='')
			return push("eof");
		
		whitespace=i;
		
		if(isAlpha||c==='_'){
			next();
			while(isAlpha||isDigit||c==='_')
				next();
			if(c==='$'||c==='#'||c==='@')
				next();
			return pushWord();
		
		}else if(isDigit){
			do
				next();
			while(isDigit);;;
			var c2=code.charAt(i+1);
			if(c==='.' && c2>='0' && c2<='9'){
				next();
				while(isDigit)
					next();
			}
			return push("number",parseFloat(getWord()));
		}else if(c==='.'){
			next();
			if(isDigit){
				do
					next();
				while(isDigit);;;
				return push("number",parseFloat(getWord()));
			}
			return push("dot");
		}else switch(c){
		
		case '"':
			var stringValue="";
			while(1){
				next();
				if(c===''){
					break;
				}else if(c==='"'){
					next();
					if(c!=='"')
						break;
					else
						stringValue+='"';
				}else
					stringValue+=c;
			}
			return push("string",stringValue);
		
		break;case '\'':
			next();
			while(c && c!=='\n' && c!=='\r')
				next();
			next();
			return push("linebreak","");
		
		break;case '#':
			next();
			if(isAlpha||isDigit||c==='_'){
				next();
				while(isAlpha||isDigit||c==='_')
					next();
				var constName=getWord().toUpperCase();
				var constValue=constants[constName];
				if(constValue!==undefined)
					return push("number",constValue);
				else
					return push("error");
			}
			return push("error");
		
		break;case '<':
			next();
			if(c==='='||c==='<')
				next();
			return push("operator");
		
		break;case '>':
			next();
			if(c==='='||c==='>')
				next();
			return push("operator");
		
		break;case '=':
			next();
			if(c==='='){
				next();
				return push("operator");
			}
			return push("=");
		
		break;case '!':
			next();
			if(c==='='){
				next();
				return push("operator");
			}
			return push("unary");
		break;case '-':
			next();
			return push("minus");
		break;case '~':
			next();
			return push("xor");
		
		break;case '+':case '*':case '/':case '&':case '|':case '%':case '\\':case '^':
			next();
			return push("operator");
		
		break;case '\n':case '\r':
			next();
			return push("linebreak");
		
		break;case '(':case ')':case '[':case ']':case '{':case '}':case ',':case ':':
			var chr=c;
			next();
			return push(chr);
		
		break;case '?':
			next();
			return push("IMPRIMIR");
		
		break;default:
			next();
			return push("text");
		}
	};
}
