<meta name="viewport" content="width=device-width, initial-scale=1">
<base target="_tab">
<style>
  .markdown-body { margin:opx; padding: 0px; max-width: 100%; }
 </style>
<script src="https://cdn.jsdelivr.net/npm/marked/marked.min.js"></script>
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/highlightjs/cdn-release@11.4.0/build/styles/default.min.css">
<script src="https://cdn.jsdelivr.net/gh/highlightjs/cdn-release@11.4.0/build/highlight.min.js"></script>
<script src="https://kit.fontawesome.com/aee33b06ff.js" crossorigin="anonymous"></script>
<div style="position:fixed;min-width:100%;opacity:1;background:white;margin-top:0px;height:1.50em;z-index:10;"><a href="https://lightview.dev">lightview.dev</a> v1.8.1b (BETA)</div>

<div id="TOC" style="position:fixed;top:3em;max-height:97%;height:97%;opacity:1;max-width:275px;">
   <div id="header" "font-size:125%;font-weight:bold;">
      &nbsp;<span id="toggle-button" style="display:none;float:right;font-weight:bold;margin-top:0px">&lt;&lt;</span>
   </div>
   <div class="toc" style="border:1px solid grey;margin-right:5px;border-radius:5px;overflow-x:hidden;overflow-y:auto;background:whitesmoke">
   </div>
</div>
<div id="content" style="float:right;padding-top:0px;padding-right:10px;max-height:100vh;overflow:auto;opacity:1;position:relative;left:10px;top:3px">

### Introduction to Lightview

Small, simple, powerful web UI and micro front end creation ...

Great ideas from Svelte, React, Vue and Riot plus more combined into one small tool: 7.5K (minified/gzipped)</p>

  <p style="width:99%;">
    A ToDo demo does not get much simpler than this:
    <span style="float:right">
<i class="fa-brands fa-codepen"></i>
 <a href="https://codepen.io/anywhichway/details/ExQPYZL">lightview-todo</a> 
    </span>
  </p>
  <pre  height="100"><code src="./examples/todo.html"></code></pre>

#### What You Get

1) Single file and <a href="#local-templates" target=_self>template</a> components.

1) [Sandboxed remote components](#sandboxed-components) and micro front ends</a>.

1) [Unit testable](#unit-testing) components and a [debug mode](#debugging) for using standard JavaScript debuggers</a>.

1) No pre-deployment transpilation/compilation required.

1) Svelte like variable usage, i.e. write your state modifying code like normal code.

1) Extended variable type declarations including `min`, `max` and `step` on `number` or limits on `string` and `array` lengths.

1) [TypeScript like](#variables) runtime type checking of variables in components.

1) Automatic server retrieval and update of variables declared as `remote`.

1) Automatic import, export, cross-component sync, or reactive response to attributes/props/variables. See [superVariable](#super-variable).

1) [Automatic input field variable creation and binding](#auto-binding-inputs-and-forms).

1) [Attribute directives](#attribute-directives) like `l-if`, and a single powerful `l-for` that handles array and object keys, values, and entries.

1) Reactive string template literals for content and attribute value replacement.

1) No virtual DOM. The Lightview dependency tracker laser targets just those nodes that need updates.

1) SPA, and MPA friendly ... somewhat SEO friendly and short steps away from fully SEO friendly.

1) A [component library](components) including charts and gauges that work in Markdown files.

1) Lots of live [editable examples](#examples).

If you like what you get on the front-end with `Lightview`, check out our back-end reactive framework `Watchlight` at [https://watchlight.dev](https://watchlight.dev).

#### Usage

Install it from [NPMJS](https://www.npmjs.com/package/lightview). Or, visit the repository on [GitHub](https://www.github.com/anywhichway/lightview).
Note, we will actively iterate on CodePen and the NPM or GitHub versions may not be the most recent. If you want the bleeding edge
[download it from CodePen](https://000686818.codepen.website/lightview.js) and include it in your build pipeline.

It should be evident from the todo example above, Lightview components are just HTML files similar to Riot or Vue's SFCs. And, for
the most part, the code you write looks like regular JavaScript ... we modeled this on Svelte.

The script blocks in these files are set to type `lightview/module` and inside them the variable `self` is bound to the component.

The HTML in the files is rendered in a shadow DOM node and the style blocks and scripts are isolated to that shadow DOM.

You use the components in other files by inserting the Lightview script in the head of the file where you want ot use the component and load the components
using `link` tags, e.g.

```
<head>
<link href="../components/gantt/gantt.html" rel="module">
<script src="./lightview.js"></script>
</head>
<body>
<l-gantt id="myChart" style="height:500px;" title="Research Project" hidden l-unhide>
    {
    options: { },
    rows: [
    ['Research', 'Find sources',"2015-01-01", "2015-01-05", null,  100,  null],
    ['Write', 'Write paper',null,"2015-01-09", "3d", 25, 'Research,Outline'],
    ['Cite', 'Create bibliography',null, "2015-01-07","1d" , 20, 'Research'],
    ['Complete', 'Hand in paper', null, "2015-01-10", "1d" , 0, 'Cite,Write'],
    ['Outline', 'Outline paper', null, "2015-01-06", "1d" , 100, 'Research']
    ]
    }
</l-gantt>
</body>
```

You can do the same in a Markdown file, just leave out the `head` and `body` tags. You can see the [source of a Markdown file](examples/markdown.md), or [see it rendered](examples/markdown.html).

### API

<a id="variables"></a>
#### Variables

Much of the power of Lightview comes from its expressive variable declarations.

You can use the normal declarations `var`, `let`, and `const` for data that only needs to be present
within a script block. For other data, you need to declare variables using `self.variables(options)`.

```javascript
Object self.variables(
    {[name:string]:dataType:string, [ ...]},
    [{[functionalType]:boolean|string|object, ...}]
);
```

The available `dataTypes` are `"any"`, `"array"`, `"boolean"`, `"number"`, `"object"`, `"string"`. You can also provide any object constructor like, `Array`.

`FunctionalTypes` apply behaviors to variables. The available `functionalTypes` are `shared`, `reactive`, `imported`, `exported`, `observed`, `remote`, `set`, `constant`. These are reserved words and, with the exception of `set` and `constant`, are themselves functions that configure variable behavior.

If a varibable is `required`, `set` or `constant` DO NOT need to be present. The `required` is enforced when attempts are made to set the variable.

`set` can take any value that is consistent with the `dataType` of the variable(s) it is used with.

`constant` can take any value that is consistent with the `dataType` of the variable(s) it is used with.

`set` and `constant` can't be used together.

See [More On Remote Variables](#more-on-remote-variables) for details on the `string` and `object` value configuration options for `remote`.

As a result of the use of the variable definition approach, Lightview variable declarations look very much like `TypeScript`.

<a id="super-variable"></a>
You would probably never make a variable this powerful, but the below illustrates the use of most of the types of variables.

```javascript
self.variables({superVariable:"number"}, { set:1, imported, exported, shared, reactive, observed, remote:remote("./superVariable")});

observe(() => {
  console.log("superVariable changed to:",superVariable);
});
</script>
```

***Note***: `lightview/module` code is sensitive to the use/lack of of semi-colons. When in doubt, terminate your statements with semi-colons. Also,
since since Lightview compiles your code into an asynchronous function, top level `await` is supported.

Runtime type checking will be applied to ensure `superVariable` is always a number or can be coerced to a number. There is an example for [type checking](#type-checking).

It will initially be set to 1 and then an attempt to import a value from the attributes of the component will be made. If no attribute by the name of the
variable exists, the value will remain 1. Any time it changes, its value will be `exported` back up to the attributes. The value will also be `shared` with all instances of the
same component and `reactive` HTML will be re-rendered. Also see the example [Sharing State](#sharing-state).

Reactive HTML is any HTML, including attribute values (with the exception of the `name` attribute on input elements), that contains a reference or references to a variable inside a template literal.

Because `superVariable` is `observed` you can also call `addEventListener(callback)` to register a listener that will be called any time the attribute `superVariable` changes. Attributes that are `observed` are automatically `imported`. If your needs are simple, you can just rely on `reactive` rather than define a callback using `addEventListener`.

Because you declared `superVariable` as `reactive` and wrapped a function referencing it in `observe`, the function will be called every time `superVariable` changes.

And, because you declared `superVariable` as `remote` at the relative URL `./superVariable`, its value will be retrieved from the server. Also,
since you made it `reactive`, changes will be sent to the server as `PATCH` requests.

##### Extended Type Definitions

There are extended type definitions that use the symbolic names of all the basic types, e.g. `string` vs `"string"`. These extended types can be used like their string named
counterparts except they do not automatically coerce, or they can be used as functions for more sophisticated type checking, e.g. the basic types always attempt coercion, with extended types this is turned off by default, although you can turn in on. The declaration of `superVariable` above, might look like this:

```javascript
const {number} = await import("./types.js");
self.variables(
    {superVariable:number}, // note, number is not quoted
    {imported:true, exported:true, shared:true, reactive:true, observed:true, remote:"./superVariable"}
  );
await superVariable;
```

Or, if you want to coerce and constrain the value to a range, like this:

```javascript
const {number} = await import("./types.js");
self.variables(
    {superVariable:number({coerce:true,min:0,max:1000})}, // note, how number is used as a function
    {imported:true, exported:true, shared:true, reactive:true, observed:true, remote:remote("./superVariable")}
  );
await superVariable;
```

An example showing errors should help:

```
const {string,number} = await import("./types.js");
self.variables({name:string({minlength:2,maxlength:20,required:true,default:"anonymous"}),age:number});
console.log(name); // will log "anonymous"
try {
  name = "J"; // will throw an error since the value is too short
} catch(e) {
  
}
try {
  name = null; // will throw an error since a value is required
} catch(e) {
  
}
try {
  age = "10"; // will throw an error since the value is not a number
} catch(e) {
  
}
  
name = "joe"; // will succeed
age = 10; // will succeed
  
```

The extended types include:

**`any({required?:boolean,whenInvalid?:function,default?:any})`**

**`array({coerce?:boolean,required?:boolean,whenInvalid?:function,minlength?:number,maxlength?:number,default?:Array})`**

- `minlength` defaults to `0`
- `maxlength` defaults to `Infinity`

**`boolean({coerce?:boolean,required?:boolean,whenInvalid?:function,default?:boolean})`**

**`number({coerce?:boolean,required?:boolean,whenInvalid?:function,min?:number,max?:number,step?:number,allowNaN?:boolean,default?:number})`**

- `min` defaults to `-Infinity`
- `max` defaults to `Infinity`
- `step` defaults to `1`
- `allowNaN` defaults to `true`

**`object({coerce?:boolean,required?:boolean,whenInvalid?:function,default?:object})`**

**`remote(string|object)`**

Remote must be imported from `types.js` and SHOULD be called with a configuration.
See [More On Remote Variables](#more-on-remote-variables).

**`string({coerce?:boolean,required?:boolean,whenInvalid?:function,minlength?:number,maxlength?:number,pattern?:RegExp,default?:string})`**

- `minlength` defaults to `0`
- `maxlength` defaults to `Infinity`
- `pattern` ensures the value matches the RegExp prior to assignment

**`symbol({coerce?:boolean,required?:boolean,whenInvalid?:function,default?:symbol})`**

All extended types have a default `whenInvalid` parameter which throws an error when an attempt to set the varibale to an invalid value is made. A custom function
can be passed in that swallows the error and returns the existing value for the variable, or `undefined`, or some other value, for example:

```javascript
const whenInvalid = (variable) => {
    return variable.value;
}
```

you could even go ahead and make the assignment but log a warning:

```javascript
const whenInvalid = (variable,invalidValue) => {
    console.warn(`Assigning ${variable.name}:${variable.type.name||variable.type} invalid value ${invalidValue});
    return newValue;
}
```

##### More On Remote Variables

Below is an example of how simple it can be to set up remote sensor monitoring using remote variables. This example is talking to a simulator running on a Cloudflare Worker. The guages themselves are available in the Lightview [component library](components).

<pre height="140"><code src="./examples/sensors/index.html" contentonly></code></pre>

<iframe width="100%" height="225px" src="./examples/sensors/index.html"></iframe>

The easiest way to configure remote variables is to provide the absolute or relative unique URL to access the variable value, e.g.

```javascript
const {remote} = await import("./types.js");
self.variables(
    {sensor1:object}, {remote:remote("./sensors/sensor1")}
);
await sensor1;
```

**Note**: You MAY need to await the remote variable after it is declared. Future use, e.g. in template literals, will NEVER need to be awaited.

If you do not call `remote` during your variable declaration, the assumed path to the variable will be the current file path plus the variable name, e.g.

```
const {remote} = await import("./types.js");
self.variables({sensor1:object}, {remote});
```

is the same as

```
const {remote} = await import("./types.js");
self.variables({sensor1:object}, {remote:remote("./sensor1")});
```

If you call `remote` with a path that is terminates by a slash, then the variable name is appended to the path.

```
const {remote} = await import("./types.js");
self.variables({sensor1:object}, {remote:remote("https://mysite.com/sensors/")});
```

is the same as:

```
const {remote} = await import("./types.js");
self.variables({sensor1:object}, {remote:remote("https://mysite.com/sensors/sensor1")});
```

In some cases you may have an existing application that does not provide an easily addressable unique URL for each variable, in this case you can provide a configuration object providing a `get` method
(as well as `patch` and `put` if the variable is reactive and sending updates to the server), along with an optional `path` and `ttl`.

The `get` method should have the signature `get(path,variable)`. You can use the `path`, the variable definition contained in `variable`, and any variables within the closure of your method to create a URL and do your own `fetch`. Your `patch` method must parse the `fetch` response and return a Promise for JSON.

The `patch` method should have the signature `patch({target,property,value,oldValue},path,variable)`. (Currently, remotely patched variables must be objects, in the future `{value,oldValue}` will also be legal for primitive variables).

You can use data from the `target` object along with the `path`, the variable definition contained in `variable`, and any variables within the closure of your method to create a URL and do your own `fetch`. Your `patch` method must parse the `fetch` response and return a Promise for JSON.

The `put` method should have the signature `put(target,path,variable)`. You can use data from the `target` object along with the `path`, the variable definition contained in `variable`, and any variables within the closure of your method to create a URL and do your own `fetch`. Your `put` method must parse the `fetch` response and return a Promise for JSON which is the current state of the variable on the server.

The `ttl` is the number of milliseconds between server polls to refresh data. If you do not wish to poll the server, you could also implement `get` so that it establishes a websocket connection and update your variables in realtime.

Here is an example of a custom remote variable configuration for polling sensor data:

```javacript
const {remote} = await import("./types.js");
self.variables(
    { sensor1:object, sensor2:object },
    { remote:
      remote({
        path: "./sensors/",
        ttl: 10000, // get new data every 10 seconds
        get(path,variable) {
          // create a normalized full path to the sensor data
          const href = new URL(path + object.id,window.location.href).href;
          return fetch(href)
            .then((response) => {
              if(response.status===200) return response.json();
            })
        }
      })
    }
);
await sensor1;
await sensor2;
```

Here is partial example of a custom remote variable configuration for streaming data over a websocket:

```javacript
const {remote} = await import("./types.js");
// use these in the UI so that it automatically updates
self.variables({sensor1:object,sensor2:object},{reactive});
// use a variable to hold the websocket
self.variables(
    { ws: object },
    { remote:
      remote({
        path: "./sensors",
        ttl: 10000, // get new data every 10 seconds
        async get(path,variable) {
          // only create one socket
          if(!ws) {
            // create a normalized full path to the sensor data
            const href = new URL(path,window.location.href).href.replace("https://","wss://");
            ws = new WebSocket(href);
            // do websocketty stuff, ideally in a more robust way than this!
            ws.onmessage = (event) => {
              const {sensorName,value} = event.data;
              // assumes sensor1 and sensor2 are the names
              self.setVariableValue(sensorName,value);
            }
            // end websockety stuff
            return Promise.resolve(ws); // you must return a Promise for the socket
        }
      })
    }
);
await ws;
```

Since using remote variables requires running a custom server, it is not possible to demonstrate on this CodePen hosted site. Below is the source code for a very basic custom NodeJS server that will respond appropriately to remote variable requests and updates for data stored in JSON files. The full demo can be found in the [GitHub repository](https://github.com/anywhichway/lightview).

<pre  height="100"><code src="./examples/remote-server.js" contentonly></code></pre>

#### Functions

We already introduced `observe` above. There are several more functions available with Lightview and components created using Lightview.

##### Lightview

**`Class Lightview.createComponent(name:string, node:HTMLElement [, {framed:boolean, observer:MutationObsever}])`**

- Creates a component, i.e. `customElement`, using the `node` contents as a template.
- See the example [Local Templates](#local-templates).

**`HTMLCustomElement Lightview.bodyAsComponent([{as = "x-body", unhide:boolean, framed:boolean}])`**

- This function treats the body of an HTML document as a component and is typically called in a `DOMContentLoaded` event handler.
- A shorthand way of using this is to just passs the query string ``?as=x-body` to the Lightview loading script in the head of your document.
- **Note**, once a body is turned into a componet, its contents are in a `shadoDOM`, so using `document.getElementById` will not work. Instead,
  use `document.body.getElementById`. All components implement `getElementById`.
- The use of this method or the query string approach is ignored when a component is loaded as a subcomponet. Hence, you can use it to support
  the creation of unit testable components.
- See the example [Reactive Variables and Encapsultated Style](reactive-variables-and-encapsultated-style).

**`void Lightview.whenFramed(callback:function [, {isolated:boolean}])`**
- Invokes `callback` when a component file detects it is being loaded in an `iframe`.
- If `isolated` is set to true, then there will be no communication with the parent window. Otherwise, message handling is automatically implemented.
- See the example [Sandboxed Components and Micro Front Ends](#sandboxed-components).

##### Lifecycle Event Handlers

**`self.addEventListener(eventName:string,callback:function)`**
- Adds the `callback` to be invoked when the `eventName` occurs.
- This is actually just the standard `HTMLElement.addEventLister`, as such, it is availabled as a method on the element when created with `document.create`.
- Valid `eventNames` include:
    - `adopted` which will be invoked when a component is adopted by a document with the callback as `callback({type:"adopted",target:component})`.
    - `connected` which will be invoked when a component is added to a document DOM with the callback as `callback({type:"connected",target:component})`.

  > In order to prevent blocking, a number of Lightview component initialization functions are asynchronous. As a result, when a component is connected by the DOM, there may still be initialization work in flight. Once the Lightview `connected` event has fired, you can be sure all initialization work is complete.

  > If you encouter errors that say custom methods on your components are not available to other components or external scripts, then try wrapping the code that accesses these methods in a `connected` event listener.
    - `disconnected` which will be invoked when a component is removed from a DOM with the callback as `callback({type:"disconnected",target:component})`.

**`addEventListener(eventName:string,callback:function)`**
- Available in the context of `lightview/script`. Adds the `callback` to be invoked when the `eventName` occurs.
- This is a special `addEventListener` that deals with data and events internal to the component.
- Not preceded by `self.`. Just call directly. This is the [same way it works for web workers](https://developer.mozilla.org/en-US/docs/Web/API/Worker/message_event).
- Valid `eventNames` include:
    - `change` which will be invoked when variable values change with the callback as `callback({type:"change",target:component,variableName:string,value:any,oldValue:any})`.

- See the example [Sharing Exclusive Or State](#sharing-xor-state).

##### Component Variable Access

You should be careful not to overload and shadow these functions by redefining them on your component.

**`Array self.getVariable()`**
- Returns an a copy of the internal structure of a variable or `undefined`. See `self.variables` below.

**`Array self.getVariableNames()`**
- Returns an array of names of the currently defined variables for a component.

**`any self.getVariableValue(variableName:string)`**
- Gets the current value of `variableName`. Returns `undefined` if the variable does not exist.

**`boolean self.setVariableValue(variableName:string, value:any[, {coerceTo:string|function}])`**
- Sets a value for a `variableName`. Returns `true` if the variable already existed and `false` if not.
- If the variable already existed, the existing type is used and `coerceTo` is ignored.
- If the variable is created, the type is infered from the value or set to `coerceTo` (in case you want to use `any`).

**`object self.variables({[variableName]:variableType,...}[,...]})`**
- Used to declare variables as described in the [Variables](#variables) section above.
- Returns an `object`, the keys of which are variable names with the values being copies of the internal structure of the variable, e.g.

```javascript
self.variables({v1:"string"},{imported,shared});
/* returns
  {
      v1: {name: "v1", type: "string", imported:true, shared:true}
  }
*/
self.variables({v2:"number"},{exported,reactive});
/* returns
  {
      v2: {name: "v2", value:2, type: "number", exported:true, reactive:true}
  }
*/
```

##### Other Component Methods

Components are DOM nodes with a `shadowRoot` and have the standard DOM node capability, e.g. `getQuerySelector`. They also implement `getElementById` (which is normally only on a `document`).

<a id="examples"></a>
### Examples of Use

All of the code examples on this site with a Reset button and LIVE label can be edited directly on the site. Or, you can open them in CodePen using the link above the example toward the right margin.

Some examples are not implemented as Pens and can't be edited.

#### Reactive Variables and Encapsultated Style

A basic example of Lightview to show how simple reactive UI development can be.

If you declare variables as reactive, with the exception of the `name` attribute for input elements, any HTML referencing the variables will be automatically re-rendered. If you  inspect the content of the rendered view, you will also see that this particular page has turned the body into a self rendering component called 'x-body'.

The `name` attribute is excluded because making dynamic substitutions for `name` can result in VERY obscure code.

<button onclick="resetPen('QWaOyXQ')">Reset</button>
<span style="float:right">
<i class="fa-brands fa-codepen"></i>
<a href="https://codepen.io/anywhichway/details/QWaOyXQ">lightview-counter</a>
</span>

- Try modifying to put the count outside the button and change the button color.
- Try adding a reactive variable `color`, setting it to "red", and putting `background: ${color}` in the style.

<p class="codepen" data-height="390" data-theme-id="40735" data-default-tab="html,result" data-slug-hash="QWaOyXQ" data-editable="true" data-user="anywhichway" style="height: 390px; box-sizing: border-box; display: flex; align-items: center; justify-content: center; border: 2px solid; margin: 1em 0; padding: 1em;">
  <span>See the Pen <a href="https://codepen.io/anywhichway/pen/QWaOyXQ">
  hcx-counter</a> by Simon Y. Blackwell (<a href="https://codepen.io/anywhichway">@anywhichway</a>)
  on <a href="https://codepen.io">CodePen</a>.</span>
</p>
<script async src="https://cpwebassets.codepen.io/assets/embed/ei.js"></script>

#### Auto Binding Inputs And Forms

Lightview can automatically create variables based on form input field names and types.

Any time you use a string literal in the `value` attribute of form inputs, Lightview checks to see if the entirety of
the literal is a declared or undeclared variable. If it is undeclared, a reactive variable is automatically created. The
variables are then bound to the form input. For radio buttons, it just checks to see if the `name` attribute matches a variable. (This
is one of the reasons the `name` attribute on inputs can't also be a dynamically bound variable.)

Note how the only variable declared in the Pen below is `color`, because it is used outside the context of an input value in the style attribute.

<button onclick="resetPen('ExobKwx')">Reset</button>
<span style="float:right">
<i class="fa-brands fa-codepen"></i>
<a href="https://codepen.io/anywhichway/details/ExobKwx">lightview-form</a>
</span>

<p class="codepen" data-height="1070" data-theme-id="40735" data-default-tab="html,result" data-slug-hash="ExobKwx" data-editable="true" data-user="anywhichway" style="height: 1070px; box-sizing: border-box; display: flex; align-items: center; justify-content: center; border: 2px solid; margin: 1em 0; padding: 1em;">
  <span>See the Pen <a href="https://codepen.io/anywhichway/pen/ExobKwx">
  hcx-form</a> by Simon Y. Blackwell (<a href="https://codepen.io/anywhichway">@anywhichway</a>)
  on <a href="https://codepen.io">CodePen</a>.</span>
</p>
<script async src="https://cpwebassets.codepen.io/assets/embed/ei.js"></script>

You can bind or autobind an object to the `value` attribute of a form and then bind the inputs to properties on the object using dot notation paths. Also note in this example the use of `observe` in the demo instrumentation rather than a `change` event listener.

<p class="codepen" data-height="604.7999267578125" data-theme-id="40735" data-default-tab="html,result" data-slug-hash="XWZmpwX" data-editable="true" data-user="anywhichway" style="height: 604.7999267578125px; box-sizing: border-box; display: flex; align-items: center; justify-content: center; border: 2px solid; margin: 1em 0; padding: 1em;">
  <span>See the Pen <a href="https://codepen.io/anywhichway/pen/XWZmpwX">
  lightview-form</a> by Simon Y. Blackwell (<a href="https://codepen.io/anywhichway">@anywhichway</a>)
  on <a href="https://codepen.io">CodePen</a>.</span>
</p>
<script async src="https://cpwebassets.codepen.io/assets/embed/ei.js"></script>

#### Attribute Directives

Lightview supports `l-if`, `l-for`, and `:` (to handle custom boolean attributes).

<button onclick="resetPen('WNdXgrw')">Reset</button>
<span style="float:right">
<i class="fa-brands fa-codepen"></i>
<a href="https://codepen.io/anywhichway/details/WNdXgrw">lightview-directives</a>
</span>

<p class="codepen" data-height="1375" data-theme-id="40735" data-default-tab="html,result" data-slug-hash="WNdXgrw" data-editable="true" data-user="anywhichway" style="height: 1375px; box-sizing: border-box; display: flex; align-items: center; justify-content: center; border: 2px solid; margin: 1em 0; padding: 1em;">
  <span>See the Pen <a href="https://codepen.io/anywhichway/pen/WNdXgrw">
  lightview--directives</a> by Simon Y. Blackwell (<a href="https://codepen.io/anywhichway">@anywhichway</a>)
  on <a href="https://codepen.io">CodePen</a>.</span>
</p>
<script async src="https://cpwebassets.codepen.io/assets/embed/ei.js"></script>

#### Targeted Anchor/HREF Imports

Anchor elements that include an element `id` as a target can be used to import components and place them at the target. For security,
the current implementation requires the components be hosted on the same server as the requesting file or you must set the
[CORS attribute](https://developer.mozilla.org/en-US/docs/Web/HTML/Attributes/crossorigin) `crossorigin` on your `<a>` element.
(This is not a typical location for the `crossorigin` attribute).

You MUST ABSOLUTELY TRUST the server from which you are loading anchor imported components. Components can navigate up out of the `shadowDom`
and modify other areas of a page. For more on components that are loaded across origins, see [Link imports and Nested Components](#link-imports-and-nested-components)
and [Sandboxed Components](#sandboxed-components).

##### Same Origin Import

Since importing through a Pen requires cross origin activity, there is no Pen, just this included example.

<pre height="140"><code src="./examples/anchors.html"></code></pre>

##### Cross Origin Import

Pens are hosted on a separate server, so the `crossorigin` attribute is used below.

<button onclick="resetPen('BaJYXRE')">Reset</button>
<span style="float:right">
<i class="fa-brands fa-codepen"></i>
<a href="https://codepen.io/anywhichway/details/BaJYXRE">lightview-anchor-crossdomain</a>
</span>

<p class="codepen" data-height="250" data-theme-id="40735" data-default-tab="html,result" data-slug-hash="BaJYXRE" data-editable="true" data-user="anywhichway" style="height: 250px; box-sizing: border-box; display: flex; align-items: center; justify-content: center; border: 2px solid; margin: 1em 0; padding: 1em;">
<span>See the Pen <a href="https://codepen.io/anywhichway/pen/BaJYXRE">
  lightview-anchors</a> by Simon Y. Blackwell (<a href="https://codepen.io/anywhichway">@anywhichway</a>)
  on <a href="https://codepen.io">CodePen</a>.</span>
</p>
<script async src="https://cpwebassets.codepen.io/assets/embed/ei.js"></script>


<a id="templates"></a>
#### Local Templates

Template tags can be used to define components in the same file where they are used. You can actually use any DOM node,
but that's for another time...

<button onclick="resetPen('abEVNMZ')">Reset</button>
<span style="float:right">
<i class="fa-brands fa-codepen"></i>
<a href="https://codepen.io/anywhichway/details/abEVNMZ">lightview-template</a>
</span>

<p class="codepen" data-height="650" data-theme-id="40735" data-default-tab="html,result" data-slug-hash="abEVNMZ" data-editable="true" data-user="anywhichway" style="height: 650px; box-sizing: border-box; display: flex; align-items: center; justify-content: center; border: 2px solid; margin: 1em 0; padding: 1em;">
  <span>See the Pen <a href="https://codepen.io/anywhichway/pen/abEVNMZ">
  lightview-template</a> by Simon Y. Blackwell (<a href="https://codepen.io/anywhichway">@anywhichway</a>)
  on <a href="https://codepen.io">CodePen</a>.</span>
</p>
<script async src="https://cpwebassets.codepen.io/assets/embed/ei.js"></script>

<a name="link-imports-and-nested-components"></a>
#### Link Imports and Nested Components

You can import components using the `<link>` tag in the head of your components. These will be recursively loaded by components that use the component with `<link>` imports.

If you are operating cross domain (which Pens frequently do, you must include the `crossorigin` [CORS attribute](https://developer.mozilla.org/en-US/docs/Web/HTML/Attributes/crossorigin)).
You MUST ABSOLUTELY TRUST the server from which you are loading linked components.   Components can navigate up out of the `shadowDom` and modify other areas of a page. For secure
components in iframes see [Sandboxed Components](#sandboxed-components), they can also be nested.

<button onclick="resetPen('ZEvrrjM')">Reset</button>
<span style="float:right">
<i class="fa-brands fa-codepen"></i>
<a href="https://codepen.io/anywhichway/details/ZEvrrjM">lightview-nested</a>
</span>

<p class="codepen" data-height="270" data-theme-id="40735" data-default-tab="html,result" data-slug-hash="ZEvrrjM" data-editable="true" data-user="anywhichway" style="height: 270px; box-sizing: border-box; display: flex; align-items: center; justify-content: center; border: 2px solid; margin: 1em 0; padding: 1em;">
  <span>See the Pen <a href="https://codepen.io/anywhichway/pen/ZEvrrjM">
  lightview-nested</a> by Simon Y. Blackwell (<a href="https://codepen.io/anywhichway">@anywhichway</a>)
  on <a href="https://codepen.io">CodePen</a>.</span>
</p>
<script async src="https://cpwebassets.codepen.io/assets/embed/ei.js"></script>

The above Pen uses the following two remote files:

<pre  height="100"><code src="./examples/nested.html" contentonly></code></pre>

<pre  height="100"><code src="./examples/message.html" contentonly></code></pre>

In order to reduce network calls, a "compiler" that turns local links into templates in the files containing the links is under development.

<a id="type-checking"></a>
#### Type Checking

<button onclick="resetPen('GRyOgzj')">Reset</button>
<span style="float:right">
<i class="fa-brands fa-codepen"></i>
<a href="https://codepen.io/anywhichway/details/GRyOgzj">lightview-types</a>
</span>

<p class="codepen" data-height="1355" data-theme-id="40735" data-default-tab="html,result" data-slug-hash="GRyOgzj" data-editable="true" data-user="anywhichway" style="height: 1355px; box-sizing: border-box; display: flex; align-items: center; justify-content: center; border: 2px solid; margin: 1em 0; padding: 1em;">
  <span>See the Pen <a href="https://codepen.io/anywhichway/pen/GRyOgzj">
  hcx-types</a> by Simon Y. Blackwell (<a href="https://codepen.io/anywhichway">@anywhichway</a>)
  on <a href="https://codepen.io">CodePen</a>.</span>
</p>
<script async src="https://cpwebassets.codepen.io/assets/embed/ei.js"></script>

<a id="sharing-state"></a>
#### Sharing State Across Components Of Same Type

Lightview can ensure that state is the same across all instances of the same component. This example also shows
how variables declared as `imported` can be used to map attributes to content.

<button onclick="resetPen('NWXwNme')">Reset</button>
<span style="float:right">
<i class="fa-brands fa-codepen"></i>
<a href="https://codepen.io/anywhichway/details/NWXwNme">lightview-types</a>
</span>

<p class="codepen" data-height="770" data-theme-id="40735" data-default-tab="html,result" data-slug-hash="NWXwNme" data-editable="true" data-user="anywhichway" style="height: 770px; box-sizing: border-box; display: flex; align-items: center; justify-content: center; border: 2px solid; margin: 1em 0; padding: 1em;">
  <span>See the Pen <a href="https://codepen.io/anywhichway/pen/NWXwNme">
  lightview-shared</a> by Simon Y. Blackwell (<a href="https://codepen.io/anywhichway">@anywhichway</a>)
  on <a href="https://codepen.io">CodePen</a>.</span>
</p>
<script async src="https://cpwebassets.codepen.io/assets/embed/ei.js"></script>

<a id="sharing-xor-state"></a>
#### Sharing Exclusive Or State

If you had components that implemented audio streams, you would only want to play one at a time. This shows how to implement an XOR of state across components using checkboxes in place of radio buttons.

<button onclick="resetPen('mdpqPZx')">Reset</button>
<span style="float:right">
<i class="fa-brands fa-codepen"></i>
<a href="https://codepen.io/anywhichway/details/mdpqPZx">lightview-xor</a>
</span>

<p class="codepen" data-height="1010" data-theme-id="40735" data-default-tab="html,result" data-slug-hash="mdpqPZx" data-editable="true" data-user="anywhichway" style="height:1010px; box-sizing: border-box; display: flex; align-items: center; justify-content: center; border: 2px solid; margin: 1em 0; padding: 1em;">
  <span>See the Pen <a href="https://codepen.io/anywhichway/pen/mdpqPZx">
  lightview-xor</a> by Simon Y. Blackwell (<a href="https://codepen.io/anywhichway">@anywhichway</a>)
  on <a href="https://codepen.io">CodePen</a>.</span>
</p>
<script async src="https://cpwebassets.codepen.io/assets/embed/ei.js"></script>

<a name="sandboxed-components"></a>
#### Sandboxed Remote Components and Micro Front Ends

Since components can contain JavaScript, loading them from another domain brings with it
security risks. Lightview can sandbox remote components in iframes. Communication can then
occur by getting and setting attributes. Lightview manages this for you.

We can't show you a Pen here because Pens do not work well with iframe communication.

<pre height="850"><code src="./examples/foreign.html" scriptonly></code></pre>

As shown below, you only need to add two lines of code to a remote component to enable it for iframe messaging.

```html
    <script>
        Lightview.whenFramed(({as,unhide,isolated,enableFrames,framed}) => {
        Lightview.bodyAsComponent({as,unhide,isolated,enableFrames,framed});
    })
    </script>
```

The spread of the argument object above is done for clarity, you could just do this:

```html
    <script>
        Lightview.whenFramed((options) => Lightview.bodyAsComponent(options));
    </script>
```

***Note***, because the iframe demo above is doubly nested, the demo iframe does not
automatically resize. However, the nested iframe does resize based on its inner component.
You can view the demo on a [separate page](./remote.html) to get a cleaner picture.

Below is the code for the remote form, the code is the same as the form demo shown earlier
with just two lines of code and some styling added to iframe enable it. Plus, the addition of a Place Order button.

The automatically exported variable `message` is created in the component. Just assign values to it
like the `placeOrder` function below.

<pre height="400"><code src="./examples/foreignform.html" contentonly></code></pre>

The parent document requires a little more work because it must handle messages from the child.

You must this metatag to the parent document, `<meta name="l-enableFrames">` and some event handlers.

<pre height="850"><code src="./examples/foreign.html" contentonly></code></pre>

<a id="component-library"></a>
#### Component Library

Lightview comes with a component library [documented separately](components). The initial release is [Goolge Chart](https://developers.google.com/chart/) based.

<a id="debugging"></a>
### Debugging

Your `lightview/module` script are re-compiled on the fly, so you can't set break points in them directly in your source. Instead,
insert a `debugger` command at the location you wish to start debugging. When the debugger stops at that point, you can
set breakpoints in the re-compiled source.

The source is likely to be shown as just one line by your browser debugger. If you are using Chrome, Edge, and Firefox you can click `{}` in the
bottom left of the source window to pretty-print the code.

If you set the variable `lightviewDebug` to `true` in a normal script at the top of your component file, then some additional assistance is provided,
i.e. DOM nodes with template literals are left in place when executing attribute directives.

```javascript
  <script>var lightviewDebug=true</script>
```

<a id="unit-testing"></a>
### Unit Testing

You can use [Puppeteer](https://github.com/puppeteer/puppeteer) to unit test components. Below is a unit test for the counter button component when instantiated as a standalone file. As described earlier, if you provide the query string `?as=x-body` to the Lightview script in the head of a componenty definition file it can be instantiated directly. This script is ignored when loading the component from another file.

<pre  height="100"><code src="./examples/counter.test.mjs" contentonly></code></pre>

<a id="security"></a>
### Security

In addition to the cross-origin security issues discussed above, there are some security issues related to the use of
template literals to substitute values into HTML. This is particularly true if you allow un-sanitized user input as
values for variables. We strongly recommend against this for anything other than demos and prototypes. You should use
something like <a href="https://www.npmjs.com/package/dompurify">DOMPurify</a> or the new browser API
<a href="https://developer.mozilla.org/en-US/docs/Web/API/Sanitizer/sanitize">Sanitize</a> when it becomes available
in order to santize your input prior to assigning values to Lightview variables.

This being said, Lightview has a small blunt mechanism for providing some level of protection:

1) It "sanitizes" templates before attempting to resolve them by making suspicious code unparseable. The result is that the template will simply not be replaced in the component.
1) If the target node is an `HTMLElement` or `Attr`, it takes the result of the template interpolation and escapes all HTML characters
   before inserting the value into the DOM. If the target node is a `TextNode`, no escaping is conducted because it is not needed. The DOM
   will not try to treat the content of a text node like it is HTML, even if it looks just like HTML. Surprisingly, most
   of the time, the target will be a `TextNode`.

Here is the code:

```javascript
  const templateSanitizer = (string) => {
        return string.replace(/function\s+/g,"")
            .replace(/function\(/g,"")
            .replace(/=\s*>/g,"")
            .replace(/(while|do|for|alert)\s*\(/g,"")
            .replace(/console\.[a-zA-Z$]+\s*\(/g,"");
    }
    Lightview.sanitizeTemplate = templateSanitizer;

    const escaper = document.createElement('textarea');
    function escapeHTML(html) {
        escaper.textContent = html;
        return escaper.innerHTML;
    }
```

Any errors thrown by the santizier will be logged as warnings to the console and re-thrown.

If you need dynamic arrow function closures in your templates, you can replace `Lightview.sanitizeTemplate` with your own code at the
top of your component file:

```html
  <script src="./lightview.js"></script>
  <script>
   Lightview.sanitizeTemplate =  (string) => {
        return string.replace(/function\s+/g,"")
            .replace(/function\(/g,"")
            .replace(/(while|do|for|alert)\s*\(/g,"")
            .replace(/console\.[a-zA-Z$]+\s*\(/g,"");
    }
  </script>
```
Here is an example of Lightview sanitizing in action.

<button onclick="resetPen('XWVELBv')">Reset</button>
<span style="float:right">
<i class="fa-brands fa-codepen"></i>
<a href="https://codepen.io/anywhichway/details/XWVELBv">lightview-invalid-template-literals</a>
</span>

<p class="codepen" data-height="900" data-theme-id="40735" data-default-tab="html,result" data-slug-hash="XWVELBv" data-editable="true" data-user="anywhichway" style="height: 900px; box-sizing: border-box; display: flex; align-items: center; justify-content: center; border: 2px solid; margin: 1em 0; padding: 1em;">
  <span>See the Pen <a href="https://codepen.io/anywhichway/pen/XWVELBv">
  lightview-invalid-template-literals</a> by Simon Y. Blackwell (<a href="https://codepen.io/anywhichway">@anywhichway</a>)
  on <a href="https://codepen.io">CodePen</a>.</span>
</p>
<script async src="https://cpwebassets.codepen.io/assets/embed/ei.js"></script>

Finally, Lightview may be flagged by software supply chain analysis programs for the use of `eval`. Ligthview actually uses
`Function`, which is slightly less risky, but still an issue. Hence, it deserves explanation.

Lightview makes use of the much maligned but very powerful `with` statement at four locations in its codebase. The `with`
statement is not typically considered a security risk, but its uninformed use can make for slow and obscure code.

Three of the locations where `with` is used are related to template interpolation. At the expense of making the code base
substantially larger or adding 3rd party dependencies, the use of `with` could be avoided for interpolation.

The fourth use of `with` is related to `lightview/module` script execution. The means by which Ligthview is able to support
what appears to be direct coding against variables is through the use of `with` and a `Proxy`. The `with` statement is
not valid in `strict mode` Javascript like modules. The dynamic `Function` by-passes this restriction for this very limited
place in which `with` is used. It would probably not be possible to implement Ligthview as without a pre-processor if this
approach were not taken, in which case `Svelte` would be the best option.

### License

MIT License

Copyright (c) 2022 AnyWhichWay,LLC - Lightview Small, simple, powerful UI creation ...

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

### Change History

Reverse Chronological Order

If the day is `??`, then the version is currently under test on this site, but not yet commited to GitHub or updated on NPM.

2022-05-19 v1.8.1b Addressed issue with `textarea` inputs not binding properly. Link elements in the head of components are now imported when
a module link is imported. Eliminated need for script recompiles. Now, just set a `mount` function for the component. Much faster. Smaller codebase. Works better with syntax highlighters.

2022-05-11 v1.7.3b Standardized chart components so they all have a very similar API. Added additional charts `OrgChart` and `Timeline`.

2022-05-10 v1.7.2b Adjusted relative pathing for components.

2022-05-09 v1.7.1b Added support for object bound forms. Exposed `observe` for use in lightview/module scripts. Addressed issue related to single quotes causing lightview/module scripts to fail parsing. Improved `l-for` so that it is not destructive of HTML. Added `examples/todo.html`. Made `l-on` more restrictive. Value MUST now be in a template literal. Added `examples/markdown.md`.

2022-05-04 v1.6.6b Added unit tests. Simplified code for functional types.

2022-05-03 v1.6.5b Added Medium remote sensor article example.

2022-05-02 v1.6.4b Added default `whenInvalid` to all extened types. Fixed issue with extended boolean always return a valid state when not coercing. Added many unit tests.

2022-05-01 v1.6.3b GitHub repository README updates.

2022-05-01 v1.6.2b Added unit testing example and documentation. Added `self.getVariable`.

2022-04-30 v1.6.1b Renamed `variableType` to `dataType` and `variableKind` to `functionalType`. Moved functional type `remote` to the `types.js` file since it adds almost 1K of size to the core and may not be used by many developers. Fixed dates in the Change History (they were all set to 2021!).

2022-04-29 v1.5.1b Added extended type definitions, added chart and gauge components, modified lifecycle events to use event listeners.

2022-04-26 v1.4.10b Eliminated excess export of auto defined variables. Fixed unit test flaw for radio elements.

2022-04-25 v1.4.9b Added support for remote variables.

2022-04-8 v1.4.8b Addressed issue where inputs had multiple of the same event handler registered. Addressed
script tags getting processed for interpolation when they shouldn't. Added reset button to Pens. Fixed
invisible cursor issue in Pens. Fixed default selection for forms based on variables.

2022-04-7 v1.4.7b Documentation changes, addition of `any` and `object` constants, aditional sanitizing.

<script src="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.5.0/highlight.min.js"></script>
<script>
    const resetPen = (id) => {
      const pen = document.querySelector(`iframe[src*="${id}"]`);
      if(pen) pen.setAttribute("src",pen.getAttribute("src"));
    }
</script>
<script type="module">
  function fit() {
     const examples = [...document.querySelectorAll("code[src]")];
  examples.forEach(async (example) => {
    const parent = example.parentElement,
          src = example.getAttribute("src"),
          url = new URL(src,window.location.href),
          text = (await (await fetch(url.href)).text()).replace("<!DOCTYPE html>",""),
          iframe = document.createElement("iframe"),
          height = example.getAttribute("height") || example.parentElement.getAttribute("height");
    if(height) iframe.setAttribute("height",height);
    if(!example.hasAttribute("scriptonly")) {
      example.textContent = text;
      hljs.highlightElement(parent);
    }
    parent.style.setProperty("margin-right","10px");
    if(example.hasAttribute("contentonly")) return;
    if(example.parentElement!==parent) {
      while(example.lastChild) example.lastChild.remove();
      while(parent.firstChild) example.appendChild(parent.firstChild);
      parent.appendChild(example);
    }
    hljs.highlightElement(example.parentElement);
    iframe.setAttribute("src",src);
    iframe.setAttribute("class","gh-fit");
    iframe.setAttribute("style","width:100%;border-style:solid");
    parent.insertAdjacentElement("afterend",iframe);
    
  })
    
    const iframes = [...document.querySelectorAll("iframe.gh-fit")];

    iframes.forEach((ifrm) => {
        const win = ifrm.contentWindow,
          doc = win.document;
      doc.addEventListener("DOMContentLoaded",() => {
        const html = doc.documentElement,
           body = doc.body;

        if(body) {
            body.style.overflowX = "auto";
            body.style.overflowY = "auto";
        }
        if(html) {
            html.style.overflowX = "auto"; 
            html.style.overflowY = "auto";
            var style = win.getComputedStyle(html)
            ifrm.width = parseInt(style.getPropertyValue("width"));
            ifrm.height = parseInt(style.getPropertyValue("height")) + 10;
        }
      })
           
    })
}

//addEventListener("load", requestAnimationFrame.bind(this, fit))
  function generateLinkMarkup(contentElement) {
            const headings = [...contentElement.querySelectorAll('h3, h4, h5')]
            const parsedHeadings = headings.map(heading => {
                return {
                    title: heading.innerText.split(" ").map((word) => word[0].toUpperCase() + word.substring(1).toLowerCase()).join(" "),
                    depth: parseInt(heading.nodeName.replace(/\D/g,'')),
                    id: heading.getAttribute('id')
                }
            });
            let html = "";
            for(let i=0;i<parsedHeadings.length;i++) {
                const heading = parsedHeadings[i];
                if(i>0) {
                    if(heading.depth>parsedHeadings[i-1].depth) {
                        html+="<ul>"
                    } else if(heading.depth<parsedHeadings[i-1].depth) {
                        html+="</ul>"
                    }
                    html += `<li><a href="#${heading.id}" target="_self">${heading.title}</a></li>`;
                } else {
                    html += `<li><a href="#${heading.id}" target="_self">${heading.title}</a></li>`;
                }
            }
            return `<ul>${html}</ul>`;
        }
       const toc = document.querySelector(".toc");
        if(toc) {
            toc.innerHTML = generateLinkMarkup(document.body);
        }
        document.querySelectorAll('pre code').forEach((el) => {
            hljs.highlightElement(el);
            el.style.setProperty("margin-right","10px");
        });
        document.body.style = "overflow:hidden;height:100%;max-height:100%;margin-top:0px"

        let touchstartX = 0,
            touchendX = 0,
            touchstartY = 0,
            touchendY = 0,
            x = 0,
            y = 0;
        const toggle = document.getElementById("TOC"),
            header = document.getElementById("header"),
            content = document.getElementById("content");
        document.getElementById("toggle-button").style.setProperty("display","inline");
        function handleGesture({event,right,left}={}) {
            if (left && touchendX < touchstartX && Math.abs(touchstartY-touchendY)<100 && Math.abs(touchstartX-touchendX)>75) { left(); }
            else if (right && touchendX > touchstartX && touchstartX<150) { right(); }
        }
        let opened;
        function handleTOC(open) {
            const previous = opened;
            if(open===undefined) open = opened = !opened
            else opened = open;
            if(opened) {
                toc.style.setProperty("max-width","");
                toc.style.setProperty("overflow-y","auto");
                toc.style.setProperty("max-height","calc(100% - 3em)");
                toc.style.setProperty("height","calc(100% - 3em)");
                header.style.setProperty("display","initial");
                content.style.setProperty("margin-left",toc.clientWidth+10);
                content.style.setProperty("max-width",`calc(100% - ${toc.clientWidth+40}px)`);
            } else {
                toc.style.setProperty("max-width","12px");
                toc.style.setProperty("overflow-y","hidden");
                toc.style.setProperty("max-height","97%");
                toc.style.setProperty("height","97%");
                header.style.display = "none";
                content.style.setProperty("margin-left","");
                content.style.setProperty("max-width",`calc(100% - ${48}px)`);
            }
            if(opened && previous!=undefined) {
                setTimeout(()=> {
                    content.scrollTo({top:y+25});
                },250);
            } else if(!opened) {
                setTimeout(()=> {
                    content.scrollTo({top:y-25});
                },250);
            }
        }
        content.style.setProperty("margin-left",toc.clientWidth+10);
        toc.style.setProperty("max-width","12px");
        handleTOC(true)
        toc.addEventListener('touchstart', event => {
            touchstartX = event.changedTouches[0].screenX
        },{passive:true})
        toc.addEventListener('touchend', event => {
            touchendX = event.changedTouches[0].screenX
            handleGesture({left:()=>handleTOC(false),right:()=>handleTOC(true)})
        },{passive:true})
        content.addEventListener("scroll",(event) => {
            y = content.scrollTop;
        },{passive:true})
        content.addEventListener('touchstart', event => {
            touchstartX = event.changedTouches[0].screenX
            touchstartY = event.changedTouches[0].screenY
        },{passive:true})
        content.addEventListener('touchend', event => {
            touchendX = event.changedTouches[0].screenX;
            touchendY = event.changedTouches[0].screenY;
            handleGesture({right:()=>handleTOC(true),left:()=>event.preventDefault()});
        },{passive:true})
        toggle.addEventListener("click",(event) => {
          event.stopImmediatePropagation();
         if(event.target.tagName==="A" || event.target.id==="toggle-button") handleTOC(false);
            else if(!opened) handleTOC(true);
        });
  [...document.body.querySelectorAll('a[href^="#"]')].forEach((a) => {
    a.setAttribute("target","_self");
  })
  fit();
</script>
  <style>
    a:target { 
      scroll-margin-top: 24px; 
    }
    .toc {
      overflow-wrap: break-word;
    }
    .toc ul {
      margin-left: 5px;
      margin-top: 0px;
      margin-bottom: 0px;
      list-style: none; /* This removes the list styling which are provided by default */
      padding-left: 5px; /* Removes the front padding */
    }
    .toc ul li a {
      text-decoration: none; /* Removes the underline from the link tags */
      font-size: 80%
    }
    .toc ul li {
      margin-left: 0px;
      margin-top: 5px;
      margin-bottom: 5px;
      padding: 2px; /* Adds a little space around each <li> tag */
      line-height: 80%
    }
  </style>