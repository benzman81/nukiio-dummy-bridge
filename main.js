var http = require('http');
var url = require('url');
var querystring = require('querystring');
var fs = require("fs");

http.createServer(function(request, response) {
    var headers = request.headers;
    var method = request.method;

    var theUrl = request.url;
    var theUrlParts = url.parse(theUrl, true);
    var theUrlParams = theUrlParts.query;
    var theUrlPathname = theUrlParts.pathname;
    body = '', reqInfo = {};

    var body = [];
    request.on('error', function(err) {
        console.error(err);
    }).on('data', function(chunk) {
        body.push(chunk);
    }).on('end', function() {
        body = Buffer.concat(body).toString();

        response.on('error', function(err) {
            console.error(err);
        });

        response.statusCode = 200;
        response.setHeader('Content-Type', 'application/json');
        var responseBody = {
            headers: headers,
            method: method,
            url: theUrl,
            body: body,
            theUrlParams: theUrlParams,
            theUrlPathname: theUrlPathname
        };

        if(theUrlPathname === '/list' || theUrlPathname === '/list/') {
            console.log(theUrlPathname);

            responseBody = [{
                nukiId: 1,
                name: "Eingangsbereich"
            }, {
                nukiId: 2,
                name: "Vorraumtür"
            }];

            response.write(JSON.stringify(responseBody));
        }
        else if(theUrlPathname === '/lockState' || theUrlPathname === '/lockState/') {
            if(!theUrlParams.nukiId) {
                console.log(theUrlPathname + "--- no nuki id ---" + theUrlParams.nukiId);
                response.statusCode = 404;
                response.setHeader("Content-Type", "text/plain");
                response.write("ERROR " + theUrlPathname);
            }
            else {
                var nukiId = theUrlParams.nukiId;
                var state = fs.readFileSync(nukiId + ".state", "UTF-8");
                console.log(theUrlPathname + "---" + nukiId + "---" + state);
                responseBody = {
                    state: parseInt(state),
                    stateName: "Status: " + state,
                    batteryCritical: false,
                    success: "true"
                };

                response.write(JSON.stringify(responseBody));
            }
        }
        else if(theUrlPathname === '/lockAction' || theUrlPathname === '/lockAction/') {
            if(!theUrlParams.nukiId || !theUrlParams.action) {
                console.log(theUrlPathname + "--- no nuki id or action ---" + theUrlParams.nukiId + "---" + theUrlParams.action);
                response.statusCode = 404;
                response.setHeader("Content-Type", "text/plain");
                response.write("ERROR " + theUrlPathname);
            }
            else {
                var nukiId = theUrlParams.nukiId;
                var action = theUrlParams.action;
                var newState = "unsupported";
                if(action === "2") {
                    newState = 1;
                }
                else if(action === "1") {
                    newState = 2;
                }
                console.log(theUrlPathname + "---" + nukiId + "---" + action + "---" + newState);

                var state = fs.writeFileSync(nukiId + ".state", newState, "UTF-8");
                responseBody = {
                    batteryCritical: false,
                    success: "true"
                };

                response.write(JSON.stringify(responseBody));
            }
        }
        response.end();
    });
}).listen(8881);
