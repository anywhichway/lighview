const toJSON = (value) => {
    if([-Infinity,Infinity].includes(value)) return `@${value}`;
    if(typeof(value)==="number" && isNaN(value)) return "@NaN";
    if(value && typeof(value)==="object") {
        return Object.entries(value)
            .reduce((json,[key,value]) => {
                if(value && typeof(value)==="object" && value.toJSON) value = value.toJSON();
                json[key] = toJSON(value);
                return json;
            },Array.isArray(value) ? [] : {})
    }
    return value;
};
function reviver(property,value) {
    if(value==="@-Infinity") return -Infinity;
    if(value==="@Infinity") return Infinity;
    if(value==="@NaN") return NaN;
    return value;
}

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

function DataType(options) {
    if(!this || !(this instanceof DataType)) return new DataType(options);
    Object.assign(this,options);
}
DataType.prototype.toJSON = function() {
    return toJSON(this);
}

const tryParse = (value) => {
    try {
        return JSON.parse(value+"",reviver)
    } catch(e) {

    }
}

const ifInvalid = (variable) => {
    variable.validityState.type = typeof(variable.type)==="string" ? variable.type : variable.type.type;
    throw new TypeError(JSON.stringify(DataType(variable)));
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
const array = ({coerce=false, required = false,whenInvalid = ifInvalid,maxlength=Infinity,minlength=0,...rest}={}) => {
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


const validateBoolean  = function(value,variable) {
    if(value===undefined && variable.value===undefined) {
        return this.default;
    }
    if(variable.value===undefined) value = this.default;
    if(this.required && value==null) {
        variable.validityState = ValidityState({valueMissing: true});
    } else {
        const result = this.coerce ? tryParse(value) : value;
        if(typeof(result)!=="boolean") {
            variable.validityState = ValidityState({typeMismatch: true, value});
        } else {
            variable.validityState = ValidityState({valid:true});
            return result;
        }
    }
    return this.whenInvalid(variable,value);
}
const boolean = ({coerce=false,required=false, whenInvalid = ifInvalid,...rest}={}) =>{
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

const isDuration = (value) => {
    return parseDuration(value)!==undefined;
}
const durationMilliseconds = {
    ms: 1,
    s: 1000,
    m: 1000 * 60,
    h: 1000 * 60 * 60,
    d: 1000 * 60 * 60 * 24,
    w: 1000 * 60 * 60 * 24 * 7,
    mo: (1000 * 60 * 60 * 24 * 365.25)/12,
    q: (1000 * 60 * 60 * 24 * 365.25)/4,
    y: (1000 * 60 * 60 * 24 * 365.25)
}
const parseDuration = (value) => {
    if(typeof(value)==="number") return value;
    if(typeof(value)==="string") {
        const num = parseFloat(value),
            suffix = value.substring((num+"").length);
        if(typeof(num)==="number" && !isNaN(num) && suffix in durationMilliseconds) {
            return durationMilliseconds[suffix] * num;
        }
    }
    return null;
}

const validateDuration  = function(value,variable) {
    const result = parseDuration(value);
    if(result==null && variable.value===undefined) {
        return parseDuration(this.default);
    }
    if(this.required && result==null) {
        variable.validityState = ValidityState({valueMissing: true});
    } else {
        if(typeof(result)!=="number") {
            variable.validityState = ValidityState({typeMismatch:true,value});
        } else if(isNaN(result)) {
            variable.validityState = ValidityState({badInput:true,value});
        } else if(this.min!=null && result<parseDuration(this.min)) {
            variable.validityState = ValidityState({rangeUnderflow:true,value});
        } else if(this.max!=null && result>parseDuration(this.max)) {
            variable.validityState = ValidityState({rangeOverflow:true,value});
        }  else if(this.step!==null && (result % parseDuration(this.step)!==0)) {
            variable.validityState = ValidityState({rangeUnderflow:true,value});
        } else {
            variable.validityState = ValidityState({valid:true});
            return result;
        }
    }
    return this.whenInvalid(variable,value);
}
const duration = ({required = false,whenInvalid = ifInvalid,min=-Infinity,max=Infinity,step = 1,...rest}={}) => {
    if(typeof(required)!=="boolean") throw new TypeError(`required, ${JSON.stringify(required)}, must be a boolean`);
    if(typeof(whenInvalid)!=="function") throw new TypeError(`whenInvalid, ${whenInvalid}, must be a function`);
    if(min!=null && !parseDuration(min)) throw new TypeError(`min, ${JSON.stringify(min)}, must be a duration`);
    if(max!=null && !parseDuration(max)) throw new TypeError(`max, ${JSON.stringify(max)}, must be a duration`);
    if(step!=null && !parseDuration(step)) throw new TypeError(`step, ${JSON.stringify(step)}, must be a duration`);
    if(rest.default!==undefined && !parseDuration(rest.default)) throw new TypeError(`default, ${JSON.stringify(rest.default)}, must be a duration`);
    return {
        type: "duration",
        coerce: false,
        required,
        whenInvalid,
        min,
        max,
        step,
        ...rest,
        validate: validateDuration
    }
}
duration.parse = parseDuration;

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
        } else if(isNaN(result) && !this.allowNaN) {
            variable.validityState = ValidityState({badInput:true,value});
        } else if(this.min!=null && result<this.min) {
            variable.validityState = ValidityState({rangeUnderflow:true,value});
        } else if(this.max!=null && result>this.max) {
            variable.validityState = ValidityState({rangeOverflow:true,value});
        }  else if(this.step!==null && (result % this.step)!==0) {
            variable.validityState = ValidityState({rangeUnderflow:true,value});
        } else {
            variable.validityState = ValidityState({valid:true});
            return result;
        }
    }
    return this.whenInvalid(variable,value);
}
const number = ({coerce=false,required = false,whenInvalid = ifInvalid,min=-Infinity,max=Infinity,step = 1,allowNaN = true,...rest}={}) => {
    if(typeof(coerce)!=="boolean") throw new TypeError(`coerce, ${JSON.stringify(coerce)}, must be a boolean`);
    if(typeof(required)!=="boolean") throw new TypeError(`required, ${JSON.stringify(required)}, must be a boolean`);
    if(typeof(whenInvalid)!=="function") throw new TypeError(`whenInvalid, ${whenInvalid}, must be a function`);
    if(min!=null && typeof(min)!=="number") throw new TypeError(`min, ${JSON.stringify(min)}, must be a number`);
    if(max!=null && typeof(max)!=="number") throw new TypeError(`max, ${JSON.stringify(max)}, must be a number`);
    if(step!=null && typeof(step)!=="number") throw new TypeError(`step, ${JSON.stringify(step)}, must be a number`);
    if(typeof(allowNaN)!=="boolean") throw new TypeError(`step, ${JSON.stringify(allowNaN)}, must be a boolean`);
    if(rest.default!==undefined && typeof(rest.default)!=="number") throw new TypeError(`default, ${JSON.stringify(rest.default)}, must be a number`);
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
const object = ({coerce=false, required = false,whenInvalid = ifInvalid,...rest}={}) => {
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
const string = ({coerce=false, required = false,whenInvalid = ifInvalid, maxlength = Infinity, minlength = 0, pattern,...rest}={}) => {
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
const symbol = ({coerce=false,required=false, whenInvalid = ifInvalid,...rest}={}) =>{
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

const remoteProxy = ({json, variable,config, reactive, component}) => {
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
                            component.setVariableValue(variable.name,newjson)
                            //variable.value = json;
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

const handleRemote = async ({variable, functionalType, config=functionalType, component},doput) => {
    const type = typeof (config);
    let value;
    if (type === "string") {
        const href = new URL(config,window.location.href).href;
        value = (doput
            ? put(href,variable)
            : get(href,variable));
        if(variable.value===undefined) variable.value = value; // do not await here
    } else if (remote && type === "object") {
        if(!config.path) config.path = `./${variable.name}`;
        if(config.path.endsWith("/")) config.path = `${config.path}${variable.name}`;
        const href = new URL(config.path,window.location.href).href;
        if(!config.get || !config.put) {
            if(!href) throw new Error(`A remote path is required if no put function is provided for remote data`)
            if(!config.get) config.get = get;
            if(!config.put && variable.reactive) config.put = put;
        }
        value = (doput
            ? config.put(href,variable)
            : config.get(href,variable));
        if(config.ttl && !doput && !config.intervalId) {
            config.intervalId = setInterval(async () => {
                await handleRemote({variable, config, component});
                //schedule();
            },config.ttl);
        }
        if(variable.value===undefined) variable.value = value;
    }
    if(value) {
        const json = await value;
        if (json && typeof (json) === "object" && variable.reactive) {
            variable.value = remoteProxy({json, variable,config, component});
        } else {
            component.setVariableValue(variable.name,json);
        }
    }
}

const remote = (config) => {
    return {
        config,
        handleRemote
    }
}

const remoteGenerator = handleRemote;

export {ValidityState,any,array,boolean,duration,number,object,remote,remoteGenerator,string,symbol,reviver}