import * as bodyParser from "body-parser";

import { Red, Node, NodeProperties } from "node-red";

import { HandlerInput, RequestHandler, ErrorHandler, ResponseInterceptor } from 'ask-sdk-core';
import { Response, RequestEnvelope } from 'ask-sdk-model';
import { SkillBuilders, Skill } from "ask-sdk";

import { AlexaNodeRedRequestType }  from "../../alexa-node-red/alexa-node-red";
import { AlexaConfigNode } from "../alexa-config/alexa-config";


interface AlexaRequestNodeProperties extends NodeProperties {
    url: string; 
}

// Sources: 
// https://github.com/node-red/node-red/blob/master/nodes/core/io/21-httpin.js
// https://github.com/alexa/alexa-skills-kit-sdk-for-nodejs/issues/362
export function register(RED: Red) {
    const AlexaRequest = function (config: AlexaRequestNodeProperties) {         
        RED.nodes.createNode(this, config);

        if (RED.settings.httpNodeRoot !== false) {
            if (!config.url) {
                // _ is not exposed, so RED as any; I want the same message
                this.warn((RED as any)._("httpin.errors.missing-path"));
                return;
            }
            this.url = config.url;
            if (this.url[0] !== '/') {
                this.url = `/${this.url}`;
            }

            const node = this;

            const requestHandler: RequestHandler = {
                canHandle: (handlerInput : HandlerInput) : boolean => {
                    const typeIncoming = handlerInput.requestEnvelope.request.type;
                    return typeIncoming === AlexaNodeRedRequestType.LaunchRequest || 
                        typeIncoming === AlexaNodeRedRequestType.CanFulfillIntentRequest ||
                        typeIncoming === AlexaNodeRedRequestType.IntentRequest ||
                        typeIncoming === AlexaNodeRedRequestType.SessionEndedRequest
                },
                handle: (handlerInput : HandlerInput) : Response => {
                    return handlerInput.responseBuilder
                    .getResponse();
                },
            }
            
            const errorHandler: ErrorHandler = {
                canHandle(handlerInput : HandlerInput, error : Error) : boolean {
                    return error.name.startsWith('AskSdk');
                },
                handle(handlerInput : HandlerInput, error : Error) : Response {
                    return handlerInput.responseBuilder
                    .speak('An error was encountered while handling your request. Try again later')
                    .getResponse();
                },
            };
    
            const skill = SkillBuilders.custom()
                  .addRequestHandlers(
                    requestHandler
                  )         
                  .addErrorHandlers(
                    errorHandler
                  )
                  .create();

            const invokeSkill = (req, res) => {
                const requestBody = req.body as RequestEnvelope;
                skill.invoke(requestBody)
                .then((responseBody) => {
                    const msg = {
                        req: req,
                        res: res, 
                        payload: {
                            alexaRequest: requestBody,
                            alexaResponse: responseBody
                        }
                    }

                    const msgPack = [null, null, null, null, null];
                    const reqType = msg.payload.alexaRequest.request.type;
                    if(reqType === AlexaNodeRedRequestType.LaunchRequest) {
                        msgPack[0] = msg;
                    } else if(reqType === AlexaNodeRedRequestType.CanFulfillIntentRequest) {
                        msgPack[1] = msg;
                    }  else if(reqType === AlexaNodeRedRequestType.IntentRequest) {
                        msgPack[2] = msg;
                    }  else if(reqType === AlexaNodeRedRequestType.SessionEndedRequest) {
                        msgPack[3] = msg;
                    } else {
                        msgPack[4] = msg;
                    }

                    node.send(msgPack);
                })
                .catch((error) => {
                    res.status(500).json('Error during the request');
                });
            };

            const maxApiRequestSize = RED.settings.apiMaxLength || '5mb';
            RED.httpNode.post(this.url, bodyParser.json({limit:maxApiRequestSize}), invokeSkill);

            this.on("close",function() {
                //delete skill here too?
                const node = this;
                RED.httpNode._router.stack.forEach(function(route,i,routes) {
                    if (route.route && route.route.path === node.url && route.route.methods[node.method]) {
                        routes.splice(i,1);
                    }
                });
            });
        } else {
            // _ is not exposed, so RED as any; I want the same message
            this.warn((RED as any)._("httpin.errors.not-created"));
        }
    }

    RED.nodes.registerType("alexa request", AlexaRequest);
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