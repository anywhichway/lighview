const chart = (self,{packages = ["corechart"],options={},columns=[],rows=[],type,rowTransform}={}) => {
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
                    options.width = contentBoxSize.inlineSize;
                } else {
                    options.width = entry.contentRect.width;
                }
            }
            chart.draw(datatable, options);
        }),
        callback = (textNode, oldValue, newValue) => {
            datatable = new google.visualization.DataTable();
            try {
                const config = JSON5.parse(newValue.trim());
                if(config.options) options=config.options;
                if(config.columns) columns=config.columns;
                if(config.rows) rows=config.rows;
                columns.forEach((column) => {
                    datatable.addColumn(column);
                });
                if(rowTransform) rows = rows.map((row) => rowTransform(row));
                datatable.addRows(rows);
                chart.draw(datatable, options);
            } catch (e) {
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
        resizeObserver.observe(target);
        self.dispatchEvent(new Event("mounted"));
    };
    self.addEventListener("connected", ({target}) => {
        google.charts.load("current", {"packages":packages});
        google.charts.setOnLoadCallback(self.init);
    });
}

export {chart};