/*

En este TP vamos a trabajar con Prototipos en JavaScript.
En este lenguaje, las funciones pueden (usadas de forma adecuada)
ser constructores de objetos. Para que esto ocurra, una función
se invoca como new <nombre de la función>(<argumentos>), lo cual
describirá el nuevo objeto construido.
La función en si, puede asignar slots del nuevo elemento creado
(haciendo referencia a this), y puede además hacer cualquier otra
cosa que se considere adecuada.

En este caso, DomElement es una función que nos permitirá crear
objetos, la cual se define a continuación:
*/

/**
 * A DomElement is the main constructor for objects that represent
 * the Dom hierarchy.
 *
 * @param type The type of the dom element (e.g. 'div', 'p', etc.)
 * @param childrenDefinition The childrens of this current element.
 */
function DomElement(type, childrenDefinition) {
    this.type = type;
    this.styles = {};
    this.children = [];
    this.eventos = {};
    this.contens = '';
    

    for (let index = 0; index < (childrenDefinition || []).length; index++) {
        var definition = childrenDefinition[index];
        var newElement = new DomElement(definition.type, definition.children);
        newElement.__proto__ = this;
    //creo los strings para contens
        if(newElement.type === 'h1'){
            newElement.contens = 'Hola Mundo';
        } 
         if(newElement.type === 'p'){
            newElement.contens = 'Gracias por visitar mi pagina';
        }
        this.children.push(newElement);
    }
}

/*
 Los objetos que vamos a crear representan los elementos
 del DOM, hipoteticamente, pero no se espera que ejecute
 este código en un navegador ni nada parecido. Estaremos
 simulando parcialmente la forma en que un browser trabaja
 "por atrás", esa es la idea del TP.

 Así, cada elemento, tiene un tipo y una lista de hijos
 (ya que las etiquetas del DOM se anidan).

 En JS, todo objeto tiene un prototipo, identificado en el
 slot __proto__. En el caso de las funciones, hay un atributo
 especial llamado prototype, que será el objeto que actúa de
 prototipo para todo objeto que sea creado con esa función.

 Por ejemplo, si hacemos DomElement.prototype, estamos hablando
 del prototipo de cualquier objeto creado con new DomElement(...)

 Podemos modificar de diversas formas ese objeto, como se
 hace a continuación.
*/

/**
 * All Dom elements know how to print themselves
 */
DomElement.prototype.toString = function(indent) {
    if (!indent) {
        indent = 0;
    }
    var result = ' '.repeat(indent);
    result = result + 'Node ' + this.type + ' {';
    var styleKeys = Object.keys(this.styles);
    for (let index = 0; index < styleKeys.length - 1; index++) {
        var styleKey = styleKeys[index];
        result = result + styleKey + ':' + this.styles[styleKey] + ', '
    }
    if (styleKeys.length > 0) {
        result = result + styleKeys[styleKeys.length - 1] + ':' + this.styles[styleKeys[styleKeys.length - 1]];
    }
    result = result + '}'
    for (let index = 0; index < this.children.length; index++) {
        var element = this.children[index];
        result = result + "\n" + element.toString(indent+2);
    }
    return result;
}


/*
Ahora vamos a definir un objeto que simula un DOM.
Podríamos pensarlo como lo que lee el browser cuando analiza
el HTML. Nosotros lo vamos a definir como un objeto con 2
partes, type y children.
Podemos usar esos elementos para construir un DomElement
raíz, y donde los hijos serán DomElements también, ya que el
constructor de dicha función se encarga de eso.
*/

var definition = {
    type: 'html',
    children: [{
        type: 'head'
    }, {
        type: 'body',
        children: [{
            type: 'div',
            children: [{
                type: 'div',
                children: [{
                    type: 'h1'
                }, {
                    type: 'p'
                }, {
                    type: 'p'
                }]
            }, {
                type: 'section',
                children: [{
                    type: 'h1'
                }, {
                    type: 'p'
                }, {
                    type: 'p'
                }]
            }]
        }, {
            type: 'aside',
            children: [{
                type: 'h1'
            }, {
                type: 'p'
            }, {
                type: 'p'
            }]
        }]
    }]
}

/*
 * La raiz del dom será el primer elemento de nuestras definiciones.
 */
var dom = new DomElement(definition.type, definition.children);

/*
Ahora vamos a querer agregar estílos a los elementos del DOM,
simulando lo que hace el Browser cuando, luego de analizar el DOM,
les agrega los estilos tomados del CSS.

Agreguemos algunos estilos a diversos elementos.
*/

dom.children[1].styles = {
    background: 'red',
    color: 'blue',
    size: 10
};

dom.children[1].children[0].children[0].styles = {
    size: 17,
    color: 'green'
};
/**************** agrego estilos******************************/

dom.children[1].children[1].children[0].styles = {
    background: 'blue',
    color: 'yellow',
    size: 20
};

console.log(' ')
console.log(dom.toString());

/*
Ahora vamos a empezar a realizar diversas acciones sobre etos
elementos.
*/

/**************** PUNTO 1 ******************************/

/*
Queremos poder contar con una definición de estilos como a la
siguiente.
*/
var styles = {
    'body section': {
        color: 'green',
        size: 25
    },
    'body': {
        background: 'black'
    },
    'h1': {
        size: 50,
        color: 'red'
    },
    'aside h1': {
        size: 30
    }
};

/*
Estos estilos simulan lo que se leería de un CSS. Y lo que queremos es
poder aplicar todos estilos a nuestro DOM.

El objetivo, es poder aplicar esos estilos a cada elemento del dom
según indique la regla asociada.

Ej. si la regla es "h1", entonces el estilo se aplica a todos los elementos
de tipo h1, pero si es "body h1" entonces se aplica a los h1 que están
dentro de body.

Una característica importante de los estilos es que se heredan según jerarquía.
Si por ejemplo, "body" tiene como estilo color "red", entonces todos los hijos
de body también tendrán color "red", sin necesidad de agregar ese atributo a cada
uno de los hijos.

Por ej. pensemos el siguiente grupo de nodos en el dom

Node html {}
  Node head {}
  Node body {background:red, color:blue}
    Node div {}
      Node div {size:17, color:green}
        Node h1 {}

Si bien h1 no tiene ningún estilo directamente asociado, sus "verdaderos"
estilos son aquellos que surjen de heredar de sus padres.
Entonces h1 tiene los estilos {background:red, size:17, color:green}. El
color es verde ya que si un hijo tiene un estilo que tenía el padre,
lo sobreescribe, de forma similar al overriding.

Entonces haremos primero las siguientes cosas:
a) Agregaremos el método a todo nodo del dom, addStyles, que dada
una definición de estilos que representa un css, asigna los estilos
de esa definición a los correspondientes nodos del DOM.
*/

function addStyles(dom, styles) {
    for (let index = 0; index < dom.children.length; index++) {
      var element = dom.children[index];
      element.styles = { ...element.styles, ...dom.styles };
      if (styles[element.type]) {
        element.styles = { ...element.styles, ...styles[element.type] };
      }
      if (styles[dom.type + " " + element.type]) {
        dom.styles = { ...element.styles, ...styles[element.type] };
      }
      addStyles(element, styles);
    }
}
addStyles(dom, styles);

/*
b) Luego implemente para todo nodo el método getFullStyle que
describe todos los estilos que tiene un nodo (que incluyen los
propios y los heredados).
*/

DomElement.prototype.getFullStyle = function (typeElement) {
    this.children.forEach(function (child) {
      if (child.type === typeElement) {
        console.log(child.type, child.styles);
      }
      child.getFullStyle(typeElement);
    });
  };
console.log(dom.getFullStyle('div'));

/* 
c) Implemente para todo nodo el método viewStyleHierarchy, que
funciona de forma similar a toString, pero en donde se muestran
absolutamente todos los estilos, incluyendo los heredados, y
no solo aquellos que tienen asociados.
*/

  function viewStyleHierarchy(dom) {
    for (let index = 0; index < dom.children.length; index++) {
      console.log(dom.children[index].type, dom.children[index].styles);
      var element = dom.children[index];
      viewStyleHierarchy(element);
    }
  }
  
  viewStyleHierarchy(dom);

/**************** PUNTO 2 ******************************/

/*
Los elementos del DOM en un navegador pueden reaccionar a eventos
que el usuario realiza sobre ellos. Vamos a simular ese proceso.

Para que distintos elementos del DOM puedan reaccionar ante
diversos eventos. Cada elemento del dom debe entender tres
metodos más:

* on(nombreDeEvento, handler)
* off(nombreDeEvento)
* handle(nombreDeEvento)

Por ejemplo, podemos decir

dom.children[1].children[0].children[0].on('click', function() {
    console.log('Se apretó click en html body div div');
    return true;
})

El código de la función queda asociado al evento 'click' para ese
elemento del dom, y se activará cuando se haga el handle del evento.

dom.children[1].children[0].children[0].handle('click');


El tema es que queremos poder usar 'this' en la función para referirnos
al objeto que acaba de hacer el "handle" de la función. Ej.

dom.children[1].children[0].children[0].on('click', function() {
    console.log('Se apretó click en un ' + this.type);
    return true;
})

Esto puede llegar a ser un problema, ya que hay que analizar quién es this,
según el contexto de ejecución. Ojo.

Por otro lado, cuando se hace el handling de un evento, este realiza
el proceso de bubbling-up, es decir, todo padre que también sepa manejar
el evento del mismo nombre debe activar el evento.

Por ejemplo, si activamos 'click' en dom.children[1].children[0].children[0]
y dom.children[1] también sabe manejar 'click', entonces, luego de ejecutar
el 'click' para dom.children[1].children[0].children[0], se deberá hacer el
bubbling-up para que dom.children[1] maneje 'click'.

Hay una excepción, sin embargo. Cuando el handler de un hijo describe falso
luego de ejecutar, el bubbling-up se detiene.

off por su parte, desactiva el handler asociado a un evento.

Se pide entonces que realice los cambios pertinentes para que los elementos
del dom puedan tener este comportamiento.
*/
DomElement.prototype.handle = function (evento) {
    
    if (this.eventos[evento]) {

        this.eventos[evento].call(this);
    }
    if(this. __proto__ && this.__proto__.type !== 'html'){
        this.__proto__.handle(evento);
    }
  };
  
  DomElement.prototype.on = function(evento, handle) {
      var activado = true;    
      this.eventos = {...this.eventos, [evento]: handle, activado};
      
};
// Pruebas

    dom.children[1].children[0].children[0].on('onclick', function() {
        console.log('Se apretó click en un ' + this.type);
        return true;
    })
    dom.children[1].children[0].children[0].handle('onclick');

    dom.children[1].children[1].children[0].on('onmouseover', function() {
        console.log('Cambia el color cuando mueve el mousse ' + this.type);
        return true;
    })
    dom.children[1].children[1].children[0].handle('onmouseover');


DomElement.prototype.off = function(evento){
    if(this.eventos[evento])
    {
        activado = false;
        delete this.eventos[evento];
        
    }    
}
//Pruebas
dom.children[1].children[0].children[0].off('onclick');

/**************** PUNTO 3 ******************************/

/*
Queremos poder mostrar los nodos del dom de forma bonita
en la terminal, mediante el metodo display. Es decir,
otra especie de toString para los nodos.

dom.display()

No todo nodo es visible sin embargo. Solo los elementos del body
deben mostrarse en este caso, ya que el head y html son solo
contenedores. Lo mismo ocurre con div, section y aside, que son
elementos contenedores invisibles.

Así, en este caso, solo vamos a mostrar los elementos h1 y p.
Pero ¿Qué mostramos de ellos? Para hacer la cosa más divertida, vamos
a agregar un atributo "contents" a cualquier nodo, que nos permita
agregar un texto a esos elementos como contenido. Ese texto será el
que se muestre cuando llamemos a display.

Más aún, cada elemento se muestra de forma distinta según su tipo.
p muestra contents tal cual, pero h1 lo muestra todo en mayúscula,
siempre.

Además el color del texto y del fondo depende del estilo del elemento,
por lo que vamos a mostrarlo en color en la consola.
(Ver https://stackoverflow.com/questions/9781218/how-to-change-node-jss-console-font-color)

Por ejemplo,

Node html {}
  Node head {}
  Node body {background:red, color:blue}
    Node div {}
      Node div {size:17, color:green}
        Node h1 contents="Titulo 1" {}
        Node p contents="Hola mundo" {}
        Node p contents="Esto es un texto" {color: "red"}

Mostraría:

TITULO 1
Hola mundo
Esto es un texto (en rojo)
*/

DomElement.prototype.display = function() {
    var colors ={
        red: "\x1b[31m",
        green: "\x1b[32m",
        yellow : "\x1b[33m",
        blue : "\x1b[34m",
        black : "\x1b[30m",
     }
    for (let i = 0; i < this.children.length; i++) {
        if(this.children[i].type === 'h1' || this.children[i].type === 'p'){
            if(this.children[i].type === 'h1'){
                console.log(colors[this.children[i].styles.color] + this.children[i].contens.toUpperCase());
            }
            else{
                console.log(colors[this.children[i].styles.color] + this.children[i].contens);
            }
        }
        this.children[i].display();   
    }
};
dom.display();    