/*
MIT License

Copyright (c) 2020 Simon Y. Blackwell - Lightview Small, simple, powerful UI creation ...

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
*/

// <script src="https://000686818.codepen.website/lightview.js?as=x-body"></script>

const Lightview = {};

const {observe} = (() => {
    let CURRENTOBSERVER;
    const parser = new DOMParser();

    const addListener = (node,eventName,callback) => {
        node.addEventListener(eventName,callback); // just used to make code footprint smaller
    }
    const anchorHandler = async (event) => {
        event.preventDefault();
        const target = event.target;
        if (target === event.currentTarget) {
            const {as} = await importLink(target),
                targets = querySelectorAll(document, target.getAttribute("target"));
            targets.forEach((target) => {
                while (target.lastChild) target.lastChild.remove();
                target.appendChild(document.createElement(as))
            })
        }
    }
    const getNameFromPath = (path) => {
        const file = path.split("/").pop(),
            name = file.split(".")[0];
        if (name.includes("-")) return name;
        return "l-" + name;
    }
    const observe = (f, thisArg, argsList = []) => {
        function observer(...args) {
            CURRENTOBSERVER = observer;
            try {
                f.call(thisArg || this, ...argsList, ...args);
            } catch (e) {

            }
            CURRENTOBSERVER = null;
        }

        observer.cancel = () => observer.cancelled = true;
        observer();
        return observer;
    }
    const coerce = (value, toType) => {
        if (value + "" === "null" || value + "" === "undefined") return value;
        const type = typeof (value);
        if (type === toType) return value;
        if (toType === "number") return parseFloat(value + "");
        if (toType === "boolean") {
            if (["on", "checked", "selected"].includes(value)) return true;
            try {
                const parsed = JSON.parse(value + "");
                if (typeof (parsed) === "boolean") return parsed;
                return [1, "on", "checked", "selected"].includes(parsed);
            } catch (e) {
                throw new TypeError(`Unable to convert ${value} into 'boolean'`);
            }
        }
        if (toType === "string") return value + "";
        const isfunction = typeof (toType) === "function";
        if ((toType === "object" || isfunction)) {
            if (type === "object") {
                if (value instanceof toType) return value;
            }
            if (type === "string") {
                value = value.trim();
                try {
                    if (isfunction) {
                        const instance = toType === Date ? new Date() : Object.create(toType.prototype);
                        if (instance instanceof Array) {
                            const parsed = JSON.parse(value.startsWith("[") ? value : `[${value}]`);
                            if (!Array.isArray(parsed)) throw new TypeError(`Expected an Array for parsed data`)
                            parsed.forEach((item) => instance.push(item))
                        } else if (instance instanceof Date) {
                            instance.setTime(Date.parse(value));
                        } else {
                            Object.assign(instance, JSON.parse(value));
                        }
                        if (toType !== Date) {
                            Object.defineProperty(instance, "constructor", {
                                configurable: true,
                                writable: true,
                                value: toType.prototype.constructor || toType
                            });
                        }
                        return instance;
                    }
                    return JSON.parse(value);
                } catch (e) {
                    throw new TypeError(`Unable to convert ${value} into ${isfunction ? toType.name : type}`);
                }
            }
        }
        throw new TypeError(`Unable to coerce ${value} to ${toType}`)
    }
    const Reactor = (value) => {
        if (value && typeof (value) === "object") {
            if (value.__isReactor__) return value;
            const childReactors = [],
                dependents = {},
                proxy = new Proxy(value, {
                    get(target, property) {
                        if (property === "__isReactor__") return true;
                        if (target instanceof Array) {
                            if (property === "toJSON") return function toJSON() {
                                return [...target];
                            }
                            if (property === "toString") return function toString() {
                                return JSON.stringify(target);
                            }
                        }
                        let value = target[property];
                        const type = typeof (value);
                        if (CURRENTOBSERVER && typeof (property) !== "symbol" && type !== "function") {
                            const observers = dependents[property] ||= new Set();
                            observers.add(CURRENTOBSERVER)
                        }
                        if (childReactors.includes(value) || (value && type !== "object") || typeof (property) === "symbol") {
                            // Dated must be bound to work with proxies
                            if (type === "function" && [Date].includes(value)) value = value.bind(target)
                            return value;
                        }
                        if (value && type === "object") {
                            value = Reactor(value);
                            childReactors.push(value);
                        }
                        target[property] = value;
                        return value;
                    },
                    set(target, property, value) {
                        const type = typeof (value);
                        if (target[property] !== value) {
                            if (value && type === "object") {
                                value = Reactor(value);
                                childReactors.push(value);
                            }
                            target[property] = value;
                            const observers = dependents[property] || [];
                            [...observers].forEach((f) => {
                                if (f.cancelled) dependents[property].delete(f);
                                else f();
                            })
                        }
                        return true;
                    }
                });
            return proxy;
        }
        return value;
    }

    class VariableEvent {
        constructor(config) {
            Object.assign(this, config);
        }
    }

    const createVarsProxy = (vars, component, constructor) => {
        return new Proxy(vars, {
            get(target, property) {
                let {value} = target[property] || {};
                if (typeof (value) === "function") return value.bind(target);
                return value;
            },
            set(target, property, newValue) {
                const event = new VariableEvent({variableName: property, value: newValue});
                if (target[property] === undefined) {
                    target[property] = {type: "any", value: newValue}; // should we allow this,  do first to prevent loops
                    target.postEvent.value("change", event);
                    if (event.defaultPrevented) delete target[property].value;
                    return true;
                }
                const {type, value, shared, exported, constant, reactive} = target[property];
                if (constant) throw new TypeError(`${property}:${type} is a constant`);
                const newtype = typeof (newValue),
                    typetype = typeof (type);
                if (newValue == null || type === "any" || newtype === type || (typetype === "function" && newValue && newtype === "object" && newValue instanceof type)) {
                    if (value !== newValue) {
                        event.oldValue = value;
                        target[property].value = reactive ? Reactor(newValue) : newValue; // do first to prevent loops
                        target.postEvent.value("change", event);
                        if (event.defaultPrevented) target[property].value = value;
                    }
                    return true;
                }
                if (typetype === "function" && newValue && newtype === "object") {
                    throw new TypeError(`Can't assign instance of '${newValue.constructor.name}' to variable '${property}:${type.name.replace("bound ", "")}'`)
                }
                throw new TypeError(`Can't assign '${typeof (newValue)} ${newtype === "string" ? '"' + newValue + '"' : newValue}' to variable '${property}:${typetype === "function" ? type.name.replace("bound ", "") : type}'`)
            },
            keys() {
                return [...Object.keys(vars)];
            }
        });
    }
    const createObserver = (domNode) => {
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === "attributes") {
                    const name = mutation.attributeName,
                        target = mutation.target;
                    if (target.observedAttributes && target.observedAttributes.includes(name)) {
                        const value = target.getAttribute(name);
                        if (value !== mutation.oldValue) {
                            target.setValue(name, value);
                            if (target.attributeChangedCallback) target.attributeChangedCallback(name, value, mutation.oldValue);
                        }
                    }
                } else if (mutation.type === "childList") {
                    for (const target of mutation.removedNodes) {
                        if (target.disconnectedCallback) target.disconnectedCallback();
                    }
                    for (const target of mutation.addedNodes) {
                        if (target.connectedCallback) target.connectedCallback();
                    }
                }
            });
        });
        observer.observe(domNode, {subtree: true, childList: true});
        return observer;
    }
    const querySelectorAll = (node, selector) => {
        const nodes = [...node.querySelectorAll(selector)],
            nodeIterator = document.createNodeIterator(node, Node.ELEMENT_NODE);
        let currentNode;
        while (currentNode = nodeIterator.nextNode()) {
            if (currentNode.shadowRoot) nodes.push(...querySelectorAll(currentNode.shadowRoot, selector));
        }
        return nodes;
    }
    const getNodes = (root) => {
        const nodes = [];
        if (root.shadowRoot) {
            nodes.push(root, ...getNodes(root.shadowRoot))
        } else {
            for (const node of root.childNodes) {
                if (node.nodeType === Node.TEXT_NODE && node.nodeValue?.includes("${")) {
                    node.template ||= node.nodeValue;
                    nodes.push(node);
                } else if (node.nodeType === Node.ELEMENT_NODE) {
                    let skip;
                    if(node.getAttribute("type")==="radio") nodes.push(node);
                    [...node.attributes].forEach((attr) => {
                        if (attr.value.includes("${")) {
                            attr.template ||= attr.value;
                            nodes.push(node);
                        } else if (attr.name.includes(":") || attr.name.startsWith("l-")) {
                            skip = attr.name.includes("l-for:");
                            nodes.push(node)
                        }
                    })
                    if (!skip && !node.shadowRoot) nodes.push(...getNodes(node));
                }
            }
        }
        return nodes;
    }
    const resolveNode = (node, component) => {
        if (node?.template) {
            try {
                const value = Function("context", "with(context) { return `" + node.template + "` }")(component.varsProxy);
                node.nodeValue = value === "null" || value === "undefined" ? "" : value;
            } catch (e) {
                if (!e.message.includes("defined")) throw e; // actually looking for undefined or not defined
            }
        }
        return node?.nodeValue;
    }
    const render = (hasTemplate, render) => {
        let observer;
        if (hasTemplate) {
            if (observer) observer.cancel();
            observer = observe(render)
        } else {
            render();
        }
    }
    const inputTypeToType = (inputType) => {
        if (!inputType) return "any"
        if (["text", "tel", "email", "url", "search", "radio","color","password"].includes(inputType)) return "string";
        if (["number", "range"].includes(inputType)) return "number";
        if (["datetime"].includes(inputType)) return Date;
        if (["checkbox"].includes(inputType)) return "boolean";
        return "any";
    }
    const _importAnchors = (node, component) => {
        [...node.querySelectorAll('a[href][target^="#"]')].forEach((node) => {
            node.removeEventListener("click", anchorHandler);
            addListener(node,"click", anchorHandler);
        })
    }
    const bindInput = (input, name, component) => {
            const inputtype = input.tagName === "SELECT" ? "text" : input.getAttribute("type"),
                type = input.tagName === "SELECT" && input.hasAttribute("multiple") ? Array : inputTypeToType(inputtype),
                deflt = input.getAttribute("default"),
                value = input.getAttribute("value");
            let variable = component.vars[name] || {type};
            if (type !== variable.type) {
                if (variable.type === "any" || variable.type === "unknown") variable.type = type;
                else throw new TypeError(`Attempt to bind <input name="${name}" type="${type}"> to variable ${name}:${variable.type}`)
            }
            component.variables({[name]: type});
            let eventname = "change";
            if(input.tagName!=="SELECT" && (!inputtype || ["text","number","tel","email","url","search","password"].includes(inputtype))) {
                eventname = "input";
            }
            addListener(input,eventname, (event) => {
                event.stopImmediatePropagation();
                const target = event.target;
                let value = target.value;
                if (inputtype === "checkbox") {
                    value = input.checked
                } else if (target.tagName === "SELECT") {
                    if (target.hasAttribute("multiple")) {
                        value = [...target.querySelectorAll("option")]
                            .filter((option) => option.selected || resolveNode(option.attributes.value,component)==value || option.innerText == value)
                            .map((option) => option.getAttribute("value") || option.innerText);
                    }
                }
                component.varsProxy[name] = coerce(value, type);
            })
    }
    const tryParse = (value) => {
        try {
            return JSON.parse(value);
        } catch(e) {
            return value;
        }
    }
    let reserved = {
        boolean: {value: "boolean", constant: true},
        string: {value: "string", constant: true},
        number: {value: "number", constant: true},
        observed: {value: true, constant: true},
        reactive: {value: true, constant: true},
        shared: {value: true, constant: true},
        exported: {value: true, constant: true},
        imported: {value: true, constant: true}
    };
    const createClass = (domElementNode, {observer,  importAnchors}) => {
        const instances = new Set(),
            dom = domElementNode.tagName === "TEMPLATE"
                ? domElementNode.content.cloneNode(true)
                : domElementNode.cloneNode(true);
        if (domElementNode.tagName === "TEMPLATE") domElementNode = domElementNode.cloneNode(true);
        return class CustomElement extends HTMLElement {
            static get instances() {
                return instances;
            }

            constructor() {
                super();
                instances.add(this);
                observer ||= createObserver(this);
                const currentComponent = this,
                    shadow = this.attachShadow({mode: "open"}),
                    eventlisteners = {};
                this.vars = {
                    ...reserved,
                    addEventListener: {
                        value: (eventName, listener) => {
                            const listeners = eventlisteners[eventName] ||= new Set();
                            [...listeners].forEach((f) => {
                                if (listener + "" === f + "") listeners.delete(f);
                            })
                            eventlisteners[eventName].add(listener);
                        },
                        type: "function",
                        constant: true
                    },
                    postEvent: {
                        value: (eventName, event) => {
                            //event = {...event}
                            event.type = eventName;
                            eventlisteners[eventName]?.forEach((f) => f(event));
                        },
                        type: "function",
                        constant: true
                    },
                    self: {value: currentComponent, type: CustomElement, constant: true}
                };
                this.defaultAttributes = domElementNode.tagName === "TEMPLATE" ? domElementNode.attributes : dom.attributes;
                this.varsProxy = createVarsProxy(this.vars, this, CustomElement);
                ["getElementById", "querySelector", "querySelectorAll"]
                    .forEach((fname) => {
                        Object.defineProperty(this, fname, {
                            configurable: true,
                            writable: true,
                            value: (...args) => this.shadowRoot[fname](...args)
                        })
                    });
                [...dom.childNodes].forEach((child) => shadow.appendChild(child.cloneNode(true)));
                if (importAnchors) _importAnchors(shadow, this);
            }

            get siblings() {
                return [...CustomElement.instances].filter((sibling) => sibling != this);
            }

            adoptedCallback() {
                if (this.hasOwnProperty("adoptedCallback")) this.adoptedCallback();
            }

            disconnectedCallback() {
                instances.delete(this);
            }

            connectedCallback() {
                const ctx = this,
                    shadow = ctx.shadowRoot;
                for (const attr of this.defaultAttributes) this.hasAttribute(attr.name) || this.setAttribute(attr.name, attr.value);
                const scripts = shadow.querySelectorAll("script"),
                    promises = [];
                for (const script of scripts) {
                    if (script.attributes.src?.value?.includes("/lightview.js")) continue;
                    if (script.className !== "lightview" && !((script.getAttribute("type") || "").includes("lightview/"))) continue;
                    const scriptid = Math.random() + "",
                        currentScript = document.createElement("script");
                    for (const attr of script.attributes) {
                        currentScript.setAttribute(attr.name, attr.name === "type" ? attr.value.replace("lightview/", "") : attr.value);
                    }
                    currentScript.classList.remove("lightview");
                    const text = script.innerHTML.replaceAll(/\/\*[\s\S]*?\*\/|([^:]|^)\/\/.*$/gm, "$1").replaceAll(/\r?\n/g, "");
                    currentScript.innerHTML = `Function('if(window["${scriptid}"]?.ctx) { with(window["${scriptid}"].ctx) { ${text}; }  window["${scriptid}"](); }')(); `;
                    let resolver;
                    promises.push(new Promise((resolve) => resolver = resolve));
                    window[scriptid] = () => {
                        delete window[scriptid];
                        currentScript.remove();
                        resolver();
                    }
                    window[scriptid].ctx = ctx.varsProxy;
                    ctx.appendChild(currentScript);
                }
                Promise.all(promises).then(() => {
                    const nodes = getNodes(ctx);
                    nodes.forEach((node) => {
                        if (node.nodeType === Node.TEXT_NODE && node.template.includes("${")) {
                            render(!!node.template, () => resolveNode(node, this))
                        } else if (node.nodeType === Node.ELEMENT_NODE) {
                            // resolve the value before all else;
                            const attr = node.attributes.value;
                            let name;
                            if(attr && attr.template) {
                                render(!!attr.template,() => {
                                    const value = resolveNode(attr, this),
                                        eltype = resolveNode(node.attributes.type,ctx);
                                    if(eltype==="checkbox") {
                                        if(coerce(value,"boolean")===true) {
                                            node.setAttribute("checked","");
                                            node.checked = true;
                                        } else {
                                            node.removeAttribute("checked");
                                            node.checked = false;
                                        }
                                        const vname = resolveNode(node.attributes.name,ctx);
                                        if(vname) ctx.setValue(vname,node.checked,{coerceTo:"boolean"});
                                    }
                                    if(node.tagName==="SELECT") {
                                        let values = [value];
                                        if(node.hasAttribute("multiple")) values = coerce(value,Array);
                                        [...node.querySelectorAll("option")].forEach((option) => {
                                            if(option.hasAttribute("value")) {
                                                if (values.includes(resolveNode(option.attributes.value, ctx))) {
                                                    option.setAttribute("selected", "");
                                                    option.selected = true;
                                                }
                                            } else if(option.innerText.trim()===value) {
                                                option.setAttribute("selected","");
                                                option.selected = true;
                                            }
                                        })
                                    }
                                });
                                let name;
                                for(const vname of this.getVariableNames()) {
                                    if("${" + vname + "}" === attr.template) {
                                        name = vname;
                                        break;
                                    }
                                }
                                if(name) bindInput(node,name,ctx);
                            }
                            [...node.attributes].forEach((attr) => {
                                if(attr.name==="value") return;
                                const {name, value} = attr;
                                if(name==="type") {
                                    if (value === "radio") {
                                        const name = resolveNode(node.attributes.name, ctx);
                                        for (const vname of this.getVariableNames()) {
                                            if (vname === name) {
                                                render(true, () => {
                                                    const name = resolveNode(node.attributes.name, ctx),
                                                        varvalue = Function("context", "with(context) { return `${" + name + "}` }")(ctx.varsProxy);
                                                    if (varvalue == resolveNode(node.attributes.value,ctx)) {
                                                        node.setAttribute("checked", "");
                                                        node.checked = true;
                                                    } else {
                                                        node.removeAttribute("checked");
                                                        node.checked = false;
                                                    }
                                                });
                                                bindInput(node, name, ctx);
                                                break;
                                            }
                                        }
                                    }
                                }

                               const [type, ...params] = name.split(":");
                                if (type === "") { // name is :something
                                    render(!!attr.template, () => {
                                        const value = attr.value,
                                            elvalue = resolveNode(node.attributes.value,ctx),
                                            eltype = resolveNode(node.attributes.type,ctx),
                                            elname = resolveNode(node.attributes.name,ctx);
                                        if (params[0]) {
                                            if (value === "true") node.setAttribute(params[0], "")
                                            else node.removeAttribute(params[0]);
                                        } else if (eltype=== "checkbox" || node.tagName === "OPTION") {
                                            if (value === "true") node.setAttribute("checked", "")
                                            else node.removeAttribute("checked");
                                        }
                                    })
                                } else if (type === "l-on") {
                                    let listener;
                                    render(!!attr.template, () => {
                                        const value = resolveNode(attr, this);
                                        if (listener) node.removeEventListener(params[0], listener);
                                        listener = this[value] || window[value] || Function(value);
                                        addListener(node,params[0], listener);
                                    })
                                } else if (type === "l-if") {
                                    render(!!attr.template, () => {
                                        const value = resolveNode(attr, this);
                                        node.style.setProperty("display", value === "true" ? "revert" : "none");
                                    })
                                } else if (type === "l-for") {
                                    node.template ||= node.innerHTML;
                                    render(!!attr.template, () => {
                                        const [what = "each", vname = "item", index = "index", array = "array", after = false] = params,
                                            value = resolveNode(attr, this),
                                            coerced = coerce(value, what === "each" ? Array : "object"),
                                            target = what === "each" ? coerced : Object[what](coerced),
                                            html = target.reduce((html, item, i, target) => {
                                                return html += Function("context", "with(context) { return `" + node.template + "` }")({
                                                    [vname]: item,
                                                    [index]: i,
                                                    [array]: target
                                                })
                                            }, ""),
                                            parsed = parser.parseFromString(html, "text/html");
                                        if (!window.lightviewDebug) {
                                            if (after) {
                                                node.style.setProperty("display", "none")
                                            } else {
                                                while (node.lastElementChild) node.lastElementChild.remove();
                                            }
                                        }
                                        while (parsed.body.firstChild) {
                                            if (after) node.parentElement.insertBefore(parsed.body.firstChild, node);
                                            else node.appendChild(parsed.body.firstChild);
                                        }
                                    })
                                } else if (attr.template) {
                                    render(!!attr.template, () => resolveNode(attr, this));
                                }
                            })
                        }
                    })
                    shadow.normalize();
                    observer.observe(ctx, {attributeOldValue: true});
                    if (ctx.hasOwnProperty("connectedCallback")) ctx.connectedCallback();
                })
            }

            adopted(value) {
                this.adoptedCallback = value;
                //Object.defineProperty(this, "adoptedCallback", {configurable: true, writable: true, value});
            }

            connected(value) {
                this.connectedCallback = value;
                //Object.defineProperty(this, "connectedCallback", {configurable: true, writable: true, value});
            }

            attributeChanged(value) {
                this.attributeChangedCallback = value;
                //Object.defineProperty(this, "attributeChangedCallback", {configurable: true, writable: true, value});
            }

            disconnected(value) {
                Object.defineProperty(this, "disconnectedCallback", {
                    configurable: true,
                    writable: true,
                    value: () => {
                        value();
                        super.disconnectedCallback(value);
                    }
                });
            }

            getVariableNames() {
                return Object.keys(this.vars).filter((name) => {
                    return !(name in reserved) && !["self","addEventListener","postEvent"].includes(name)
                })
            }

            setValue(name, value, {shared, coerceTo = typeof (value)} = {}) {
                if (!this.isConnected) {
                    instances.delete(this);
                    return false;
                }
                let {type} = this.vars[name] || {};
                if (type) {
                    value = coerce(value, type);
                    if (this.varsProxy[name] !== value) {
                        const variable = this.vars[name];
                        if (variable.shared) {
                            const event = new VariableEvent({
                                variableName: name,
                                value: value,
                                oldValue: variable.value
                            });
                            variable.value = value;
                            this.vars.postEvent.value("change", event);
                            if (event.defaultPrevented) variable.value = value;
                        } else {
                            this.varsProxy[name] = value;
                        }
                    }
                    return true;
                }
                this.vars[name] = {name, type: coerceTo, value: coerce(value, coerceTo)};
                return false;
            }

            getValue(variableName) {
                return this.vars[variableName]?.value;
            }

            variables(variables, {observed, reactive, shared, exported, imported} = {}) { // options = {observed,reactive,shared,exported,imported}
                const addEventListener = this.varsProxy.addEventListener;
                if (variables !== undefined) {
                    Object.entries(variables)
                        .forEach(([key, type]) => {
                            const variable = this.vars[key] ||= {name: key, type};
                            if (observed || imported) {
                                variable.value = this.hasAttribute(key) ? coerce(this.getAttribute(key), variable.type) : variable.value;
                                variable.observed = observed;
                                variable.imported = imported;
                            }
                            if (reactive) {
                                variable.reactive = true;
                                this.vars[key] = Reactor(variable);
                            }
                            if (shared) {
                                variable.shared = true;
                                addEventListener("change", ({variableName, value}) => {
                                    if (this.vars[variableName]?.shared) {
                                        this.siblings.forEach((instance) => instance.setValue(variableName, value))
                                    }
                                })
                            }
                            if (exported) {
                                variable.exported = true;
                                // in case the export goes up to an iframe
                                if (variable.value != null) setComponentAttribute(this, key, variable.value);
                                addEventListener("change", ({variableName, value}) => {
                                    value = typeof (value) === "string" || !value ? value : JSON.stringify(value);
                                    if (value == null) removeComponentAttribute(this, variableName);
                                    else setComponentAttribute(this, variableName, value);
                                })
                            }
                        });
                }
                return Object.entries(this.vars)
                    .reduce((result, [key, variable]) => {
                        result[key] = {...variable};
                        return result;
                    }, {});
            }

            constants(variables) {
                if (variables !== undefined) {
                    Object.entries(variables)
                        .forEach(([key, value]) => {
                            const type = typeof (value) === "function" ? value : typeof (value),
                                variable = this.vars[key];
                            if (variable !== undefined) throw new TypeError(`${variable.constant ? "const" : "let"} ${key}:${variable.type} already declared.`);
                            if (value === undefined) throw new TypeError(`const ${key}:undefined must be initialized.`);
                            this.vars[key] = {type, value, constant: true};
                        })
                }
                return Object.entries(this.vars)
                    .reduce((result, [key, variable]) => {
                        if (variable.constant) result[key] = {...variable};
                        return result;
                    }, {});
            }
        }
    }
    const createComponent = (name, node, {observer, importAnchors} = {}) => {
        let ctor = customElements.get(name);
        if (ctor) {
            console.warn(new Error(`${name} is already a CustomElement. Not redefining`));
            return ctor;
        }
        ctor = createClass(node, {observer, importAnchors});
        customElements.define(name, ctor);
        return ctor;
    }
    Lightview.createComponent = createComponent;
    //Object.defineProperty(Lightview, "createComponent", {writable: true, configurable: true, value: createComponent})
    const importLink = async (link, observer) => {
        const url = (new URL(link.getAttribute("href"), window.location.href)),
            as = link.getAttribute("as") || getNameFromPath(url.pathname);
        if (url.hostname !== window.location.hostname) {
            throw new URIError(`importLink:HTML imports must be from same domain: ${url.hostname}!=${location.hostname}`)
        }
        if (!customElements.get(as)) {
            const html = await (await fetch(url.href)).text(),
                dom = parser.parseFromString(html, "text/html"),
                importAnchors = !!dom.head.querySelector('meta[name="l-importAnchors"]'),
                unhide = !!dom.head.querySelector('meta[name="l-unhide"]');
            if (unhide) dom.body.removeAttribute("hidden");
            createComponent(as, dom.body, {observer, importAnchors});
        }
        return {as};
    }
    const importLinks = async () => {
        const observer = createObserver(document.body);
        for (const link of [...document.querySelectorAll("link[href][rel=module]")]) {
            await importLink(link);
        }
    }

    const bodyAsComponent = ({as = "x-body", unhide, importAnchors} = {}) => {
        const parent = document.body.parentElement;
        createComponent(as, document.body, {importAnchors});
        const component = document.createElement(as);
        parent.replaceChild(component, document.body);
        Object.defineProperty(document, "body", {
            enumerable: true, configurable: true, get() {
                return component;
            }
        });
        if (unhide) component.removeAttribute("hidden");
    }
    Lightview.bodyAsComponent = bodyAsComponent;
    const postMessage = (data, target = window.parent) => {
        if (postMessage.enabled) {
            if (target instanceof HTMLIFrameElement) {
                data = {...data, href: window.location.href};
                target.contentWindow.postMessage(JSON.stringify(data), "*");
            } else {
                data = {...data, iframeId: document.lightviewId, href: window.location.href};
                target.postMessage(JSON.stringify(data), "*");
            }
        }
    }
    const setComponentAttribute = (node, name, value) => {
        if (node.getAttribute(name) !== value) node.setAttribute(name, value);
        postMessage({type: "setAttribute", argsList: [name, value]});
    }
    const removeComponentAttribute = (node, name, value) => {
        node.removeAttribute(name);
        postMessage({type: "removeAttribute", argsList: [name]});
    }
    const getNodePath = (node, path = []) => {
        path.unshift(node);
        if (node.parentNode && node.parentNode !== node.parentNode) getNodePath(node.parentNode, path);
        return path;
    }
    const onresize = (node, callback) => {
        const resizeObserver = new ResizeObserver(() => callback());
        resizeObserver.observe(node);
    };

    const url = new URL(document.currentScript.getAttribute("src"), window.location.href);
    let domContentLoadedEvent;
    addListener(window,"DOMContentLoaded", (event) => domContentLoadedEvent = event);
    const loader = async (whenFramed) => {
        if (!!document.querySelector('meta[name="l-importLinks"]')) await importLinks();
        const importAnchors = !!document.querySelector('meta[name="l-importAnchors"]'),
            unhide = !!document.querySelector('meta[name="l-unhide"]'),
            isolated = !!document.querySelector('meta[name="l-isolate"]'),
            enableFrames = !!document.querySelector('meta[name="l-enableFrames"]');
        if (whenFramed) {
            whenFramed({unhide, importAnchors, isolated, enableFrames});
            if (!isolated) {
                postMessage.enabled = true;
                addListener(window,"message", ({data}) => {
                    const {type, argsList} = JSON.parse(data);
                    if (type === "framed") {
                        const resize = () => {
                            const {width, height} = document.body.getBoundingClientRect();
                            postMessage({type: "setAttribute", argsList: ["width", width]})
                            postMessage({type: "setAttribute", argsList: ["height", height + 20]});
                        }
                        resize();
                        onresize(document.body, () => {
                            resize();
                        });
                        return
                    }
                    if (type === "setAttribute") {
                        const [name, value] = [...argsList],
                            variable = document.body.vars[name];
                        if (variable && variable.imported) document.body.setValue(name, value);
                        return;
                    }
                    if (type === "removeAttribute") {
                        const [name] = argsList[0],
                            variable = document.body.vars[name];
                        if (variable && variable.imported) document.body.setValue(name, undefined);

                    }
                });
                const url = new URL(window.location.href);
                document.lightviewId = url.searchParams.get("id");
                postMessage({type: "DOMContentLoaded"})
            }
        } else if (url.searchParams.has("as")) {
            bodyAsComponent({as: url.searchParams.get("as"), unhide, importAnchors});
        }
        if (enableFrames) {
            postMessage.enabled = true;
            addListener(window,"message", (message) => {
                const {type, iframeId, argsList, href} = JSON.parse(message.data),
                    iframe = document.getElementById(iframeId);
                if (iframe) {
                    if (type === "DOMContentLoaded") {
                        postMessage({type: "framed", href: window.location.href}, iframe);
                        Object.defineProperty(domContentLoadedEvent, "currentTarget", {
                            enumerable: false,
                            configurable: true,
                            value: iframe
                        });
                        domContentLoadedEvent.href = href;
                        domContentLoadedEvent.srcElement = iframe;
                        domContentLoadedEvent.bubbles = false;
                        domContentLoadedEvent.path = getNodePath(iframe);
                        Object.defineProperty(domContentLoadedEvent, "timeStamp", {
                            enumerable: false,
                            configurable: true,
                            value: performance.now()
                        })
                        iframe.dispatchEvent(domContentLoadedEvent);
                        return;
                    }
                    if (type === "setAttribute") {
                        const [name, value] = [...argsList];
                        if (iframe.getAttribute(name) !== value + "") iframe.setAttribute(name, value);
                        return;
                    }
                    if (type === "removeAttribute") {
                        iframe.removeAttribute(...argsList);
                        return;
                    }
                }
                console.warn("iframe posted a message without providing an id", message);
            });
            const mutationCallback = (mutationsList) => {
                const console = document.getElementById("console");
                for (const {target, attributeName, oldValue} of mutationsList) {
                    if (!["height", "width"].includes(attributeName)) {
                        const value = target.getAttribute(attributeName);
                        if (!value) postMessage({type: "removeAttribute", argsList: [attributeName]}, iframe)
                        else if (value !== oldValue) postMessage({
                            type: "setAttribute",
                            argsList: [attributeName, value]
                        }, iframe)
                    }
                }
            };
            const observer = new MutationObserver(mutationCallback),
                iframe = document.getElementById("myframe");
            observer.observe(iframe, {attributes: true, attributeOldValue: true});
        }
    }
    const whenFramed = (f, {isolated} = {}) => {
        addListener(document,"DOMContentLoaded", (event) => loader(f));
    }
    Lightview.whenFramed = whenFramed;
    //Object.defineProperty(Lightview, "whenFramed", {configurable: true, writable: true, value: whenFramed});
    if (window.location === window.parent.location || !(window.parent instanceof Window) || window.parent !== window) { // CodePen mucks with window.parent
        addListener(document,"DOMContentLoaded", () => loader())
    }

    return {observe}
})();