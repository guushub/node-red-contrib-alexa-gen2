import { Red, Node, NodeProperties } from "node-red";

interface AlexaResponseNodeProperties extends NodeProperties {
    shouldEndSession: boolean; 
}

// Sources: 
// https://github.com/node-red/node-red/blob/master/nodes/core/io/21-httpin.js
// https://github.com/alexa/alexa-skills-kit-sdk-for-nodejs/issues/362
export function register(RED: Red) {
    const AlexaResponse = function (config: AlexaResponseNodeProperties) {         
        RED.nodes.createNode(this, config);
        const node = this;

        this.on("input",function(msg) {
            if (msg.res) {
                const headers = {
                    "Content-Type": "application/json;charset=UTF-8",
                    "Content-Length": ""
                }
                // if (msg.headers) {
                //     if (msg.headers.hasOwnProperty('x-node-red-request-node')) {
                //         var headerHash = msg.headers['x-node-red-request-node'];
                //         delete msg.headers['x-node-red-request-node'];
                //         var hash = hashSum(msg.headers);
                //         if (hash === headerHash) {
                //             delete msg.headers;
                //         }
                //     }
                //     if (msg.headers) {
                //         for (var h in msg.headers) {
                //             if (msg.headers.hasOwnProperty(h) && !headers.hasOwnProperty(h)) {
                //                 headers[h] = msg.headers[h];
                //             }
                //         }
                //     }
                // }
                if (Object.keys(headers).length > 0) {
                    msg.res._res.set(headers);
                }

                const statusCode = 200;
                if (typeof msg.payload == "object" && !Buffer.isBuffer(msg.payload)) {
                    msg.res._res.status(statusCode).jsonp(msg.payload);
                } else {
                    if (msg.res._res.get('content-length') == null) {
                        var len;
                        if (msg.payload == null) {
                            len = 0;
                        } else if (Buffer.isBuffer(msg.payload)) {
                            len = msg.payload.length;
                        } else if (typeof msg.payload == "number") {
                            len = Buffer.byteLength(""+msg.payload);
                        } else {
                            len = Buffer.byteLength(msg.payload);
                        }
                        msg.res._res.set('content-length', len);
                    }

                    if (typeof msg.payload === "number") {
                        msg.payload = ""+msg.payload;
                    }
                    msg.res._res.status(statusCode).send(msg.payload);
                }
            } else {
                node.warn((RED as any)._("httpin.errors.no-response"));
            }
        });

    }

    RED.nodes.registerType("alexa response", AlexaResponse);
}


// const LaunchRequestHandler : RequestHandler = {
//   canHandle(handlerInput : HandlerInput) : boolean {
//     return handlerInput.requestEnvelope.request.type === 'LaunchRequest'
//   },
//   handle(handlerInput : HandlerInput) : Response {
//     const speechText = 'Hello Launch!';

//     return handlerInput.responseBuilder
//       .speak(speechText)
//       .withSimpleCard('Hello Launch', speechText)
//       .getResponse();
//   },
// };

// const IntentRequestHandler : RequestHandler = {
//     canHandle(handlerInput : HandlerInput) : boolean {
//       return handlerInput.requestEnvelope.request.type === 'IntentRequest'
//     },
//     handle(handlerInput : HandlerInput) : Response {
//       const speechText = 'Hello Intent!';
  
//       return handlerInput.responseBuilder
//         .speak(speechText)
//         .withSimpleCard('Hello Intent', speechText)
//         .getResponse();
//     },
//   };

// function createRequestWrapper(node,req) {
//     // This misses a bunch of properties (eg headers). Before we use this function
//     // need to ensure it captures everything documented by Express and HTTP modules.
//     var wrapper = {
//         _req: req
//     };
//     var toWrap = [
//         "param",
//         "get",
//         "is",
//         "acceptsCharset",
//         "acceptsLanguage",
//         "app",
//         "baseUrl",
//         "body",
//         "cookies",
//         "fresh",
//         "hostname",
//         "ip",
//         "ips",
//         "originalUrl",
//         "params",
//         "path",
//         "protocol",
//         "query",
//         "route",
//         "secure",
//         "signedCookies",
//         "stale",
//         "subdomains",
//         "xhr",
//         "socket" // TODO: tidy this up
//     ];
//     toWrap.forEach(function(f) {
//         if (typeof req[f] === "function") {
//             wrapper[f] = function() {
//                 node.warn((RED as any)._("httpin.errors.deprecated-call",{method:"msg.req."+f}));
//                 var result = req[f].apply(req,arguments);
//                 if (result === req) {
//                     return wrapper;
//                 } else {
//                     return result;
//                 }
//             }
//         } else {
//             wrapper[f] = req[f];
//         }
//     });


//     return wrapper;
// }
// function createResponseWrapper(node,res) {
//     var wrapper = {
//         _res: res
//     };
//     var toWrap = [
//         "append",
//         "attachment",
//         "cookie",
//         "clearCookie",
//         "download",
//         "end",
//         "format",
//         "get",
//         "json",
//         "jsonp",
//         "links",
//         "location",
//         "redirect",
//         "render",
//         "send",
//         "sendfile",
//         "sendFile",
//         "sendStatus",
//         "set",
//         "status",
//         "type",
//         "vary"
//     ];
//     toWrap.forEach(function(f) {
//         wrapper[f] = function() {
//             node.warn((RED as any)._("httpin.errors.deprecated-call",{method:"msg.res."+f}));
//             var result = res[f].apply(res,arguments);
//             if (result === res) {
//                 return wrapper;
//             } else {
//                 return result;
//             }
//         }
//     });
//     return wrapper;
// }