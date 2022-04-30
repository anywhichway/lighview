function ValidityState(options) {
    if(!this || !(this instanceof ValidityState)) return new ValidityState(options);
    Object.assign(this,{
        valid:false,
        badInput:undefined,
        customError:undefined,
        patternMismatch:undefined,
        rangeUnderflow:undefined,
        rangeOverflow:undefined,
        typeMismatch:undefined,
        valueMissing:undefined,
        stepMistmatch:undefined,
        tooLong:undefined,
        tooShort:undefined
    },options);
}

const tryParse = (value) => {
    try {
        return JSON.parse(value+"")
    } catch(e) {

    }
}

const ifInvalid = (variable) => {
    variable.validityState.type = typeof(variable.type)==="string" ? variable.type : variable.type.type;
    throw new TypeError(JSON.stringify(variable));
    // or could return existing value variable.value
    // or could return nothing
}

const validateAny = function(value,variable) {
    if(value===undefined && variable.value===undefined) {
        return this.default;
    }
    if(this.required && value==null) {
        variable.validityState = ValidityState({valueMissing: true});
    } else {
        variable.validityState = ValidityState({valid:true});
        return value;
    }
    return this.whenInvalid(variable,value);
}
const any = ({required=false,whenInvalid = ifInvalid,...rest}) => { // ...rest allows use of property "default", which is otherwise reserved
    if(typeof(required)!=="boolean") throw new TypeError(`required, ${JSON.stringify(required)}, must be a boolean`);
    if(typeof(whenInvalid)!=="function") throw new TypeError(`whenInvalid, ${whenInvalid}, must be a function`);
    return {
        type: "any",
        required,
        whenInvalid,
        ...rest,
        validate: validateAny
    }
}
any.validate = validateAny;
any.required = false;

const validateArray  = function(value,variable) {
    if(value===undefined && variable.value===undefined) {
        return this.default;
    }
    if(this.required && value==null) {
        variable.validityState = ValidityState({valueMissing: true});
    } else {
        let result = this.coerce && typeof(value)==="string" ? tryParse(value.startsWith("[") ? value : `[${value}]`) : value;
        if (!Array.isArray(result)) {
            if (value.includes(",")) result = value.split(",");
        }
        if(typeof(result)!=="object" || !(result instanceof Array || Array.isArray(result))) {
            variable.validityState = ValidityState({typeMismatch:true,value});
        } else if(result.length<this.minlength) {
            variable.validityState = ValidityState({tooShort:true,value});
        } else if(result.length>this.maxlength) {
            variable.validityState = ValidityState({tooLong:true,value});
        } else {
            variable.validityState = ValidityState({valid:true});
            return result;
        }
    }
    return this.whenInvalid(variable,value);
}
const array = ({coerce=false, required = false,whenInvalid = ifInvalid,maxlength=Infinity,minlength=0,...rest}) => {
    if(typeof(coerce)!=="boolean") throw new TypeError(`coerce, ${JSON.stringify(coerce)}, must be a boolean`);
    if(typeof(required)!=="boolean") throw new TypeError(`required, ${JSON.stringify(required)}, must be a boolean`);
    if(typeof(whenInvalid)!=="function") throw new TypeError(`whenInvalid, ${whenInvalid}, must be a function`);
    if(typeof(maxlength)!=="number") throw new TypeError(`maxlength, ${JSON.stringify(maxlength)}, must be a number`);
    if(typeof(minlength)!=="number") throw new TypeError(`minlength, ${JSON.stringify(minlength)}, must be a number`);
    if(rest.default!==undefined && (typeof(rest.default)!=="object" || !(rest.default instanceof Array || Array.isArray(rest.default)))) throw new TypeError(`default, ${rest.default}, must be an Array`);
    return {
        type: "array",
        coerce,
        required,
        whenInvalid,
        maxlength,
        minlength,
        ...rest,
        validate: validateArray
    }
}
array.validate = validateArray;
array.coerce = false;
array.required = false;

const validateBoolean  = function(value,variable) {
    if(value===undefined && variable.value===undefined) {
        return this.default;
    }
    if(variable.value===undefined) value = this.default;
    if(this.required && value==null) {
        variable.validityState = ValidityState({valueMissing: true});
    } else {
        const result = !!(this.coerce ? tryParse(value) : value);
        if(typeof(result)!=="boolean") {
            variable.validityState = ValidityState({typeMismatch: true, value});
        } else {
            variable.validityState = ValidityState({valid:true});
            return result;
        }
    }
    return this.whenInvalid(variable,value);
}
const boolean = ({coerce=false,required=false, whenInvalid = ifInvalid,...rest}) =>{
    if(typeof(coerce)!=="boolean") throw new TypeError(`coerce, ${JSON.stringify(coerce)}, must be a boolean`);
    if(typeof(required)!=="boolean") throw new TypeError(`required, ${JSON.stringify(required)}, must be a boolean`);
    if(typeof(whenInvalid)!=="function") throw new TypeError(`whenInvalid, ${whenInvalid}, must be a function`);
    if(rest.default!==undefined && typeof(rest.default)!=="boolean") throw new TypeError(`default, ${rest.default}, must be a boolean`);
    return {
        type: "boolean",
        coerce,
        required,
        whenInvalid,
        ...rest,
        validate: validateBoolean
    }
}
boolean.validate = validateBoolean;
boolean.coerce = false;
boolean.required = false;

const validateNumber  = function(value,variable) {
    if(value===undefined && variable.value===undefined) {
        return this.default;
    }
    if(this.required && value==null) {
        variable.validityState = ValidityState({valueMissing: true});
    } else {
        const result = this.coerce ? tryParse(value) : value;
        if(typeof(result)!=="number") {
            variable.validityState = ValidityState({typeMismatch:true,value});
        } else if(isNaN(result) && !allowNaN) {
            variable.validityState = ValidityState({badInput:true,value});
        } else if(result<this.min) {
            variable.validityState = ValidityState({rangeUnderflow:true,value});
        } else if(result>this.max) {
            variable.validityState = ValidityState({rangeOverflow:true,value});
        }  else if((result % this.step)!==0) {
            variable.validityState = ValidityState({rangeUnderflow:true,value});
        } else {
            variable.validityState = ValidityState({valid:true});
            return result;
        }
    }
    return this.whenInvalid(variable,value);
}
const number = ({coerce=false,required = false,whenInvalid = ifInvalid,min=-Infinity,max=Infinity,step = 1,allowNaN = true,...rest}) => {
    if(typeof(coerce)!=="boolean") throw new TypeError(`coerce, ${JSON.stringify(coerce)}, must be a boolean`);
    if(typeof(required)!=="boolean") throw new TypeError(`required, ${JSON.stringify(required)}, must be a boolean`);
    if(typeof(whenInvalid)!=="function") throw new TypeError(`whenInvalid, ${whenInvalid}, must be a function`);
    if(typeof(min)!=="number") throw new TypeError(`min, ${JSON.stringify(min)}, must be a number`);
    if(typeof(max)!=="number") throw new TypeError(`max, ${JSON.stringify(max)}, must be a number`);
    if(typeof(step)!=="number") throw new TypeError(`step, ${JSON.stringify(step)}, must be a number`);
    if(typeof(allowNaN)!=="boolean") throw new TypeError(`step, ${JSON.stringify(allowNaN)}, must be a boolean`);
    if(rest.default!==undefined && typeof(rest.default)!=="number") throw new TypeError(`default, ${rest.default}, must be a number`);
    return {
        type: "number",
        coerce,
        required,
        whenInvalid,
        min,
        max,
        step,
        allowNaN,
        ...rest,
        validate: validateNumber
    }
}
number.validate = validateNumber;
number.min = -Infinity;
number.max = Infinity;
number.coerce = false;
number.required = false;
number.allwNaN = true;
number.step = 1;

const validateObject  = function(value,variable) {
    if(value===undefined && variable.value===undefined) {
        return this.default;
    }
    if(this.required && value==null) {
        variable.validityState = ValidityState({valueMissing: true});
    } else {
        const result = this.coerce ? tryParse(value) : value;
        if(typeof(result)!=="object") {
            variable.validityState = ValidityState({typeMismatch:true,value});
        } else {
            variable.validityState = ValidityState({valid:true});
            return result;
        }
    }
    return this.whenInvalid(variable,value);
}
const object = ({coerce=false, required = false,whenInvalid = ifInvalid,...rest}) => {
    if(typeof(coerce)!=="boolean") throw new TypeError(`coerce, ${JSON.stringify(coerce)}, must be a boolean`);
    if(typeof(required)!=="boolean") throw new TypeError(`required, ${JSON.stringify(required)}, must be a boolean`);
    if(typeof(whenInvalid)!=="function") throw new TypeError(`whenInvalid, ${whenInvalid}, must be a function`);
    if(rest.default!==undefined && typeof(rest.default)!=="object") throw new TypeError(`default, ${rest.default}, must be of type object`);
    return {
        type: "object",
        coerce,
        required,
        whenInvalid,
        ...rest,
        validate: validateObject
    }
}
object.validate = validateObject;
object.coerce = false;
object.required = false;

const validateString  = function(value,variable) {
    if(value===undefined && variable.value===undefined) {
        return this.default;
    }
    if(this.required && value==null) {
        variable.validityState = ValidityState({valueMissing: true});
    } else {
        const result = this.coerce ? value+"" : value;
        if(typeof(result)!=="string") {
            variable.validityState = ValidityState({typeMismatch:true,value});
        } else if(result.length<this.minlength) {
            variable.validityState = ValidityState({tooShort:true,value});
        } else if(result.length>this.maxlength) {
            variable.validityState = ValidityState({tooLong:true,value});
        } else {
            variable.validityState = ValidityState({valid:true});
            return result;
        }
    }
    return this.whenInvalid(variable,value);
}
const string = ({coerce=false, required = false,whenInvalid = ifInvalid, maxlength = Infinity, minlength = 0, pattern, ...rest}) => {
    if(typeof(coerce)!=="boolean") throw new TypeError(`coerce, ${JSON.stringify(coerce)}, must be a boolean`);
    if(typeof(required)!=="boolean") throw new TypeError(`required, ${JSON.stringify(required)}, must be a boolean`);
    if(typeof(whenInvalid)!=="function") throw new TypeError(`whenInvalid, ${whenInvalid}, must be a function`);
    if(typeof(maxlength)!=="number") throw new TypeError(`maxlength, ${JSON.stringify(maxlength)}, must be a number`);
    if(typeof(minlength)!=="number") throw new TypeError(`minlength, ${JSON.stringify(minlength)}, must be a number`);
    if(pattern && (typeof(pattern)!=="object" || !(pattern instanceof RegExp))) throw new TypeError(`pattern, ${pattern}, must be a RegExp`);
    if(rest.default!==undefined && typeof(rest.default)!=="string") throw new TypeError(`default, ${rest.default}, must be a string`);
    return {
        type: "string",
        coerce,
        required,
        whenInvalid,
        maxlength,
        minlength,
        ...rest,
        validate: validateString
    }
}
string.validate = validateString;
string.coerce = false;
string.required = false;
string.maxlength = Infinity;
string.minlength = 0;

const validateSymbol  = function(value,variable) {
    if(value===undefined && variable.value===undefined) {
        return this.default;
    }
    if(this.required && value==null) {
        variable.validityState = ValidityState({valueMissing: true});
    } else {
        const result = !!(this.coerce && typeof(value)!=="symbol" ? Symbol(value+"") : value);
        if(typeof(result)!=="symbol") {
            variable.validityState = ValidityState({typeMismatch: true, value});
        } else {
            variable.validityState = ValidityState({valid:true});
            return result;
        }
    }
    return this.whenInvalid(variable,value);
}
const symbol = ({coerce=false,required=false, whenInvalid = ifInvalid,...rest}) =>{
    if(typeof(coerce)!=="boolean") throw new TypeError(`coerce, ${JSON.stringify(coerce)}, must be a boolean`);
    if(typeof(required)!=="boolean") throw new TypeError(`required, ${JSON.stringify(required)}, must be a boolean`);
    if(typeof(whenInvalid)!=="function") throw new TypeError(`whenInvalid, ${whenInvalid}, must be a function`);
    if(rest.default!==undefined && typeof(rest.default)!=="symbol") throw new TypeError(`default, ${rest.default}, must be a symbol`);
    return {
        type: "symbol",
        coerce,
        required,
        whenInvalid,
        ...rest,
        validate: validateSymbol
    }
}
symbol.validate = validateSymbol;
symbol.coerce = false;
symbol.required = false;

const remoteProxy = ({json, variable,config, reactive}) => {
    const type = typeof (config);
    return new Proxy(json, {
        get(target,property) {
            if(property==="__remoteProxytarget__") return json;
            return target[property];
        },
        async set(target, property, value) {
            if(value && typeof(value)==="object" && value instanceof Promise) value = await value;
            const oldValue = target[property];
            if (oldValue !== value) {
                let remotevalue;
                if (type === "string") {
                    const href = new URL(config,window.location.href).href;
                    remotevalue = patch({target,property,value,oldValue},href,variable);
                } else if(config && type==="object") {
                    let href;
                    if(config.path) href = new URL(config.path,window.location.href).href;
                    if(!config.patch) {
                        if(!href) throw new Error(`A remote path is required is no put function is provided for remote data`)
                        config.patch = patch;
                    }
                    remotevalue = config.patch({target,property,value,oldValue},href,variable);
                }
                if(remotevalue) {
                    await remotevalue.then((newjson) => {
                        if (newjson && typeof (newjson) === "object" && reactive) {
                            const target = variable.value?.__reactorProxyTarget__ ? json : variable.value;
                            Object.entries(newjson).forEach(([key,newValue]) => {
                                if(target[key]!==newValue) target[key] = newValue;
                            })
                            Object.keys(target).forEach((key) => {
                                if(!(key in newjson)) delete target[key];
                            });
                            if(variable.value?.__reactorProxyTarget__) {
                                const dependents = variable.value.__dependents__,
                                    observers = dependents[property] || [];
                                [...observers].forEach((f) => {
                                    if (f.cancelled) dependents[property].delete(f);
                                    else f();
                                })
                            }
                        } else {
                            variable.value = json;
                        }
                    })
                }
            }
            return true;
        }
    })
}

const patch = ({target,property,value,oldValue},href,variable) => {
    return fetch(href, {
        method: "PATCH",
        body: JSON.stringify({property,value,oldValue}),
        headers: {
            "Content-Type": "application/json"
        }
    }).then((response) => {
        if (response.status < 400) return response.json();
    })
}

const get = (href,variable) => {
    return fetch(href)
        .then((response) => {
            if (response.status < 400) return response.json();
        })
}

const put = (href,variable) => {
    return fetch(href, {
        method: "PUT",
        body: JSON.stringify(variable.value),
        headers: {
            "Content-Type": "application/json"
        }
    }).then((response) => {
        if (response.status === 200) return response.json();
    })
}

const handleRemote = async ({variable, config, reactive},doput) => {
    const type = typeof (config);
    let value;
    if (type === "string") {
        const href = new URL(config,window.location.href).href;
        value = (doput
            ? put(href,variable)
            : get(href,variable));
        if(variable.value===undefined) variable.value = value;
    } else if (remote && type === "object") {
        let href;
        if(config.path) href = new URL(config.path,window.location.href).href;
        if(!config.get || !config.put) {
            if(!href) throw new Error(`A remote path is required is no put function is provided for remote data`)
            if(!config.get) config.get = get;
            if(!config.put) config.put = put;
        }
        value = (doput
            ? config.put(href,variable)
            : config.get(href,variable));
        if(config.ttl && !doput && !config.intervalId) {
            config.intervalId = setInterval(async () => {
                await handleRemote({variable, config, reactive});
            })
        }
        if(variable.value===undefined) variable.value = value;
    }
    if(value) {
        variable.value = await value.then((json) => {
            if (json && typeof (json) === "object" && reactive) {
                return remoteProxy({json, variable,config, reactive})
            } else {
                return json;
            }
        })
    }
}

const remote = (config) => {
    return {
        config,
        handleRemote
    }
}

export {ValidityState,any,array,boolean,number,string,symbol,remote}