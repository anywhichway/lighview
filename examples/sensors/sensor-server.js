const http = require("http"),
    fs = require("fs"),
    host = 'localhost',
    port = 8000,
    requestListener = async function (req, res) {
        const path = `.${req.url}`;
        res.setHeader("Access-Control-Allow-Origin","*");
        res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS");
        res.setHeader("Access-Control-Allow-Headers", "*");
        res.setHeader("Content-Type", "application/json");
        if(req.method==="OPTIONS") {
            res.end();
            return;
        }
        if(req.method==="GET") {
            const value = `${40 + Math.round(60 * Math.random())}`;
            console.log("GET",req.url,"<-",value);
            res.setHeader("Content-Length", value.length);
            res.write(value);
            res.end();
            return;
        }
        console.log(req.method);
    },
    server = http.createServer(requestListener);
server.listen(port, host, () => {
    console.log(`Server is running on http://${host}:${port}`);
});


