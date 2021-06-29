console.log("En este capítulo construiremos un lenguaje de programación llamado 'Egg'. Será un lenguaje pequeño y simple, pero lo");
console.log("suficientemente poderoso como para expresar cualquier cálculo que se nos ocurra. Permitirá una abstracción simple basada");
console.log("en funciones.");

console.log();

console.log("La parte más visible de un lenguaje de programación es su sintaxis o notación. Un analizador (parser) es un programa que lee");
console.log("un fragmento de texto y produce una estructura de datos que refleja la estructura del programa contenido en ese texto. Si el");
console.log("texto no forma un programa válido, el analizador debe señalar el error. Nuestro lenguaje tendrá una sintaxis simple y");
console.log("uniforme. Todo en 'Egg' es una expresión. Una expresión puede ser el nombre de una variable, un número, una cadena o una");
console.log("aplicación. Las aplicaciones se utilizan para llamar a funciones pero también para construcciones como condicionales o");
console.log("bucles.");

console.log();

console.log("Para matener el analizador simple, las cadenas en Egg no admiten nada como los scapes de barra invertida. Una cadena es");
console.log("simplemente una secuencia de caracteres que no son comillas dobles, entre comillas dobles. Un número es una secuencia de");
console.log("dígitos. Los nombres de variables pueden constar de cualquier carácter que no sea un espacio en blanco y que no tenga un");
console.log("significado especial en la sintaxis. Las aplicaciones se escriben como están en JS, colocando paréntesis después de una");
console.log("expresión y con cualquier número de argumentos entre los paréntesis, separados por comas e.g. página 202/203.");

console.log();

console.log("La uniformidad del lenguaje Egg hace que las cosas que son operadores en JS (como >) sean variables normales, aplicadas");
console.log("como otras funciones. Y dado que la sintaxis no tiene el concepto de bloque, necesitamos una construcción 'do' que");
console.log("representa una secuencia de cosas que hay que hacer. La estructura de datos que usará el analizador para describir un");
console.log("programa consta de objetos de expresión, cada uno de los cuales tiene una propiedad de tipo que indica el tipo de expresión");
console.log("que es y otras propiedades para describir su contenido. Las expresiones de tipo 'value' representan cadenas o números");
console.log("literales. Las expresiones de tipo 'word' se utilizan por identificadores (names). Tales objetos tienen una propiedad");
console.log("'name' que contiene el nombre del identificador como una cadena. Finalmente las expresiones 'apply' representan aplicaciones.");
console.log("Tienen una propiedad de operador que se refiere a la expresión que se está aplicando, así como una propiedad 'args' que");
console.log("contiene un array de expresiones de argumentos. La parte '>(x, 5)' del programa de las páginas 202/203 se representaría así:");

/*{
	type: "apply",
	operator: {type: "word", name: ">"},
	args: [
		{type: "word", name: "x"},
		{type: "value", value: 5}
	]
}*/

console.log("Esta estructura de datos se denomina árbol de sintaxis (syntax tree). Si imaginamos los objetos como puntos y los vínculos");
console.log("entre ellos como líneas entre estos puntos, la forma resultante es como la de un árbol. El hecho de que las expresiones");
console.log("contengan otras expresiones, que a su vez podrían contener más expresiones, es similar a la forma en que las ramas de los");
console.log("árboles se dividen y vuelven a dividirse e.g. página 204.");

console.log();

console.log("El enfoque del analizador de este capítulo es que las expresiones no se separan en líneas y tienen una estructura recursiva.");
console.log("Las expresiones de aplicación contienen otras expresiones. Este problema se puede resolver escribiendo una función de");
console.log("analizador que sea recursiva de manera que refleje la naturaleza recursiva del lenguaje. Definimos una función");
console.log("'parseExpression', que toma una cadena como entrada y devuelve un objeto que contiene la estructura de datos para la");
console.log("expresión al comienzo de la cadena, junto con la parte de la cadena que queda después de analizar esta expresión.");

console.log();

console.log("Al analizar subexpresiones (e.g. el argumento de una aplicación), esta función se puede llamar de nuevo, dando como resultado");
console.log("la expresión del argumento así como el texto que queda. Este texto, a su vez puede contener más argumentos o puede ser el");
console.log("paréntesis de cierre que finaliza la lista de argumentos. Esta es la primera parte del analizador:");

function parseExpression(program) {
	program = skipSpace(program);
	let match, expr;
	if (match = /^"([^"]*)"/.exec(program)) {
		expr = {type: "value", value: match[1]};
	} 
	else if (match = /^\d+\b/.exec(program)) {
		expr = {type: "value", value: Number(match[0])};
	} 
	else if (match = /^[^\s(),#"]+/.exec(program)) {
		expr = {type: "word", name: match[0]};
	} 
	else {
		throw new SyntaxError("Unexpected syntax: " + program);
	}
	return parseApply(expr, program.slice(match[0].length));
}

function skipSpace(string) {
	let first = string.search(/\S/);
	if (first == -1) return "";
	return string.slice(first);
}

console.log();

console.log("Debido a que Egg, como JS, permite cualquier cantidad de espacios en blanco entre sus elementos, tenemos que cortar");
console.log("repetidamente el espacio en blanco del inicio de la cadena del programa. Esto lo hace la función skipSpace. Después de omitir");
console.log("cualquier espacio inicial, parseExpression usa tres expresiones regulares para detectar los tres elementos atómicos que admite");
console.log("Egg: cadenas, números y palabras. El analizador construye un tipo diferente de estructura de datos dependiendo de cuál");
console.log("coincida. Si la entrada no coincide con una de estas tres formas, no es una expresión válida y el analizador genera un error.");
console.log("Luego cortamos la parte que coincidió con la cadena del programa y la pasamos, junto con el objeto de la expresión, a");
console.log("parseApply, que verifica si la expresión es una aplicación. Si es así, analiza una lista de argumentos entre paréntesis.");

function parseApply(expr, program) {
	program = skipSpace(program);
	if (program[0] != "(") {
		return {expr: expr, rest: program};
	}

	program = skipSpace(program.slice(1));
	expr = {type: "apply", operator: expr, args: []};
	while (program[0] != ")") {
		let arg = parseExpression(program);
		expr.args.push(arg.expr);
		program = skipSpace(arg.rest);
		if (program[0] == ",") {
	  		program = skipSpace(program.slice(1));
		} 
		else if (program[0] != ")") {
	  		throw new SyntaxError("Expected ',' or ')'");
		}
	}
	return parseApply(expr, program.slice(1));
}

console.log();

console.log("Si el siguiente carácter del programa no es un paréntesis de apertura, esta no es una aplicación y parseApply devuelve");
console.log("la expresión que se le dio. De lo contrario, omite el paréntesis de apertura (línea 103) y crea el objeto");
console.log("de árbol de sintaxis (línea 104) para esta expresión de aplicación. Luego llama recursivamente a parseExpression para");
console.log("analizar cada argumento hasta que se encuentra un paréntesis de cierre (línea 106). La recursividad es indirecta, a través");
console.log("de parseApply y parseExpression llamándose entre sí. La función parseApply debe, después de analizar una aplicación, volver");
console.log("a llamarse a sí misma (línea 115) para comprobar si hay otro par de paréntesis.");

console.log();

console.log("Esto es todo lo que necesitamos para analizar Egg. Lo envolvemos en una función de análisis conveniente que verifica que ha");
console.log("llegado al final de la cadena de entrada después de analizar la expresión (un programa Egg es una expresión única), y eso");
console.log("nos da la estructura de datos del programa.");

function parse(program) {
	let {expr, rest} = parseExpression(program);
	if (skipSpace(rest).length > 0) throw new SyntaxError("Unexpected text after program");
	return expr;
}

console.log(parse("+(a, 10)"));

console.log("El evaluador, interpreta la expresión que representa el arbol de sintaxis i retorna un valor asociado a dicha expresión i.e.");
console.log("ejecuta el programa per se. También analiza el ámbito de las variables.");

var specialForms = Object.create(null);

function evaluate(expr, scope) {
  if (expr.type == "value") {
    return expr.value;
  } else if (expr.type == "word") {
    if (expr.name in scope) {
      return scope[expr.name];
    } else {
      throw new ReferenceError(
        `Undefined binding: ${expr.name}`);
    }
  } else if (expr.type == "apply") {
    let {operator, args} = expr;
    if (operator.type == "word" &&
        operator.name in specialForms) {
      return specialForms[operator.name](expr.args, scope);
    } else {
      let op = evaluate(operator, scope);
      if (typeof op == "function") {
        return op(...args.map(arg => evaluate(arg, scope)));
      } else {
        throw new TypeError("Applying a non-function.");
      }
    }
  }
}

console.log("El objeto 'specialForms' se utiliza para definir una sintaxis especial en Egg.");

specialForms.if = (args, scope) => {
  if (args.length != 3) {
    throw new SyntaxError("Wrong number of args to if");
  } else if (evaluate(args[0], scope) !== false) {
    return evaluate(args[1], scope);
  } else {
    return evaluate(args[2], scope);
  }
};

console.log("Similar al operador ternario de JS.");

specialForms.while = (args, scope) => {
  if (args.length != 2) {
    throw new SyntaxError("Wrong number of args to while");
  }
  while (evaluate(args[0], scope) !== false) {
    evaluate(args[1], scope);
  }

  // Since undefined does not exist in Egg, we return false,
  // for lack of a meaningful result.
  return false;
};

specialForms.do = (args, scope) => {
  let value = false;
  for (let arg of args) {
    value = evaluate(arg, scope);
  }
  return value;
};

console.log("El siguiente método emula la asignación de un valor a una variable. Similar al operador '='.");

specialForms.define = (args, scope) => {
  if (args.length != 2 || args[0].type != "word") {
    throw new SyntaxError("Incorrect use of define");
  }
  let value = evaluate(args[1], scope);
  scope[args[0].name] = value;
  return value;
};

console.log("El siguiente objeto represeta el ámbito global de un código Egg.");

var topScope = Object.create(null);

topScope.true = true;
topScope.false = false;

console.log("A continuación se definen operadores aritméticos y relacionales.");

for (let op of ["+", "-", "*", "/", "==", "<", ">"]) {
  topScope[op] = Function("a, b", `return a ${op} b;`);
}

console.log("Y una forma de imprimir valores.");

topScope.print = value => {
  console.log(value);
  return value;
};

console.log("La siguiente función analiza un programa y lo ejecuta en un ámbito nuevo");

function run(program) {
  return evaluate(parse(program), Object.create(topScope));
}

console.log("El siguiente programa suma los 10 primeros valores del conjunto de los números naturales");

run(`
do(define(total, 0),
   define(count, 1),
   while(<(count, 11),
		do(define(total, +(total, count)),
			define(count, +(count, 1)))),
			print(total))`);

console.log("El siguiente método implementa la posibilidad de definir funciones en Egg");


specialForms.fun = (args, scope) => {
  if (!args.length) {
    throw new SyntaxError("Functions need a body");
  }
  let body = args[args.length - 1];
  let params = args.slice(0, args.length - 1).map(expr => {
    if (expr.type != "word") {
      throw new SyntaxError("Parameter names must be words");
    }
    return expr.name;
  });

  return function() {
    if (arguments.length != params.length) {
      throw new TypeError("Wrong number of arguments");
    }
    let localScope = Object.create(scope);
    for (let i = 0; i < arguments.length; i++) {
      localScope[params[i]] = arguments[i];
    }
    return evaluate(body, localScope);
  };
};

console.log("Las funciones en Egg tienen su propio ámbito local. E.g.:");

run(`
do(define(plusOne, fun(a, +(a, 1))),
	print(plusOne(10)))
`);

run(`
do(define(pow, fun(base, exp,
		if(==(exp, 0),
			1,
			*(base, pow(base, -(exp, 1)))))),
			print(pow(2,10)))`);
