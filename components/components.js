const chart = (self,{packages = ["corechart"],options={},columns=[],rows=[],type,optionsTransform, rowTransform}={}) => {
    options = {...options};
    columns = [...columns];
    let chart,
        datatable;
    const chartProxy = (chart) => {
        const extras = {
            setOption(name,value) {
                options[name] = value;
                chart.draw(datatable, options);
            },
            setOptions(newOptions) {
                options = {...newOptions};
                chart.draw(datatable, options);
            }
        };
        return new Proxy(chart,{
            get(target,property) {
                let value = extras[property];
                if(value!==undefined) return value;
                value = target[property];
                if(value!==undefined) return Reflect.get(target,property);
                value = datatable[property];
                if(typeof(value)==="function") {
                    if(["add","insert","remove","set"].some((prefix) => property.startsWith(prefix))) {
                        return (...args) => { value.call(datatable,...args); chart.draw(datatable,options); };
                    };
                    return value.bind(datatable);
                };
            }
        });
    };
    const target = self.getElementById("target"),
        resizeObserver = new ResizeObserver(entries => {
            for (let entry of entries) {
                if(entry.contentBoxSize) {
                    // Firefox implements `contentBoxSize` as a single content rect, rather than an array
                    const contentBoxSize = Array.isArray(entry.contentBoxSize) ? entry.contentBoxSize[0] : entry.contentBoxSize;
                    if(options.width !== contentBoxSize.inlineSize) {
                        options.width = contentBoxSize.inlineSize;
                        chart.draw(datatable, options);
                    }
                } else {
                    if(options.width !== entry.contentRect.width) {
                        options.width = entry.contentRect.width;
                        chart.draw(datatable, options);
                    }
                }
            }
        }),
        callback = (textNode, oldValue, newValue) => {
            datatable = new google.visualization.DataTable();
            try {
                const config = JSON5.parse(newValue.trim());
                if(config.options) Object.assign(options,config.options);
                if(config.columns) columns=config.columns;
                if(config.rows) rows=config.rows;
                columns.forEach((column) => {
                    datatable.addColumn(column);
                });
                if(optionsTransform) options = optionsTransform(options);
                if(rowTransform) rows = rows.map((row,index) => rowTransform(row,index,options));
                datatable.addRows(rows);
                const {selectedStyle,style} = options;
                rows.forEach((row,index) => {
                    if(selectedStyle) datatable.setRowProperty(index,"selectedStyle",selectedStyle);
                    if(style) datatable.setRowProperty(index,"style",style);
                });
                chart.draw(datatable, options);
            } catch (e) {
                console.error(e + newValue);
                target.innerText = e + newValue;
            }
        };
    self.firstChild.innerText = "Loading ...";
    self.variables({type: "string", title: "string", style: "string"}, {observed:true});
    if(self.hasAttribute("style")) target.setAttribute("style",self.getAttribute("style"));
    self.init = () => {
        if(!options.title && self.hasAttribute("title")) options.title = self.getAttribute("title");
        self.chart = chart = chartProxy(new google.visualization[type||self.getAttribute("type")](target));
        addEventListener("change",({target,value}) => {
            if (target === "type") {
                chart = new google.visualization[type](target);
            } else if (target === "title") {
                options.title = value;
            } else if(target === "style") {
                target.setAttribute("style",value);
            }
            chart.draw(datatable, options);
        });
        const node = self.firstChild;
        callback(node, node.textContent, node.textContent);
        // Will be used by the Lightview global observer
        node.characterDataMutationCallback = callback;
        // resized charts if window resizes
        resizeObserver.observe(document.body);
        self.dispatchEvent(new Event("mounted"));
    };
    self.addEventListener("connected", ({target}) => {
        const gscript = document.createElement("script");
        gscript.setAttribute("src","https://www.gstatic.com/charts/loader.js");
        gscript.onload = () => {
            google.charts.load("current", {"packages":packages});
            google.charts.setOnLoadCallback(self.init);
        };
        self.appendChild(gscript);
    });
    const jscript = document.createElement("script");
    jscript.setAttribute("src","https://unpkg.com/json5@^2.0.0/dist/index.min.js");
    document.head.appendChild(jscript);
}

export {chart};