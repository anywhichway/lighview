const http = require("http"),
    fs = require("fs"),
    host = 'localhost',
    port = 8000,
    requestListener = async function (req, res) {
        const path = `.${req.url}`;
        res.setHeader("Access-Control-Allow-Origin","*");
        res.setHeader("Access-Control-Allow-Methods", "*");
        res.setHeader("Access-Control-Allow-Headers", "*");
        res.setHeader("Content-Type", "application/json");
        if(req.method==="OPTIONS") {
            res.end();
            return;
        }
        if(req.method==="GET") {
            console.log("GET",req.url);
            res.write(fs.readFileSync(path));
            res.end();
            return;
        }
        const buffers = [];
        for await(const chunk of req) {
            buffers.push(chunk);
        }
        const data = JSON.parse(Buffer.concat(buffers).toString());
        console.log(req.method,req.url,data);
        if(req.method==="PUT") {
            const string = JSON.stringify(data);
            fs.writeFileSync(path,string);
            res.write(string);
            res.end();
            return;
        }
        if(req.method==="PATCH") {
            const {property,value,oldValue} = data,
                json = JSON.parse(fs.readFileSync(path));
            if(property!==undefined && json[property]===oldValue) { // probably need a deepEqual for a production use
                json[property] = value;
                fs.writeFileSync(path,JSON.stringify(json))
            }
            res.write(JSON.stringify(json));
            res.end();
            return;
        }
    },
    server = http.createServer(requestListener);
server.listen(port, host, () => {
    console.log(`Server is running on http://${host}:${port}`);
});


