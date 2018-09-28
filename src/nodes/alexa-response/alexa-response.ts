import { Red, Node, NodeProperties } from "node-red";
import { HandlerInput, RequestHandler, ErrorHandler, ResponseInterceptor } from 'ask-sdk-core';
import { Response, RequestEnvelope } from 'ask-sdk-model';
import { SkillBuilders } from "ask-sdk";
import { AlexaNodeRedRequestType, AlexaResponseAddition } from "../../alexa-node-red/alexa-node-red";
import { Utilities } from "../../utilities/utilities";

interface AlexaResponseNodeProperties extends NodeProperties {
    shouldEndSession: boolean; 
}

interface ExtendedHandlerInput extends HandlerInput {
    requestEnvelope: ExtendedRequestEnvelope
}

interface ExtendedRequestEnvelope extends RequestEnvelope {
    alexaResponseAddition: AlexaResponseAddition
}
// Sources: 
// https://github.com/node-red/node-red/blob/master/nodes/core/io/21-httpin.js
// https://github.com/alexa/alexa-skills-kit-sdk-for-nodejs/issues/362
export function register(RED: Red) {
    const AlexaResponse = function (config: AlexaResponseNodeProperties) {         
        RED.nodes.createNode(this, config);
        const node = this;

        this.on("input",function(msg) {
            if (msg.res && msg.req) {
                const res = msg.res._res;
                const req = msg.req._req;
                req.body.alexaResponseAddition = {
                    speachOutput: "Hoi from response!"
                }
                

                const headers = {
                    "Content-Type": "application/json;charset=UTF-8",
                    "Content-Length": ""
                }

                if (Object.keys(headers).length > 0) {
                    msg.res._res.set(headers);
                }

                const requestHandler: RequestHandler = {
                    canHandle: (handlerInput : ExtendedHandlerInput) : boolean => {
                        const typeIncoming = handlerInput.requestEnvelope.request.type;
                        return typeIncoming === AlexaNodeRedRequestType.LaunchRequest || 
                            typeIncoming === AlexaNodeRedRequestType.CanFulfillIntentRequest ||
                            typeIncoming === AlexaNodeRedRequestType.IntentRequest ||
                            typeIncoming === AlexaNodeRedRequestType.SessionEndedRequest
                    },
                    handle: (handlerInput : ExtendedHandlerInput) : Response => {
                        let responseBuilder = handlerInput.responseBuilder;
                        const responseInfo = handlerInput.requestEnvelope.alexaResponseAddition;
                        if(!responseInfo) {
                            return responseBuilder
                            .withShouldEndSession(true)
                            .getResponse();
                        }

                        responseBuilder = responseBuilder.withShouldEndSession(responseInfo.withShouldEndSession === true);

                        if(responseInfo.speachOutput) {
                            responseBuilder = responseBuilder.speak(responseInfo.speachOutput);
                        }

                        if(responseInfo.card) {
                            responseBuilder.withSimpleCard(
                                responseInfo.card.cardTitle, 
                                responseInfo.card.cardContent
                            );
                        }

                        if(responseInfo.card && (responseInfo.card.smallImageUrl || responseInfo.card.largeImageUrl)) {
                            responseBuilder.withStandardCard(
                                responseInfo.card.cardTitle, 
                                responseInfo.card.cardContent,
                                responseInfo.card.smallImageUrl,
                                responseInfo.card.largeImageUrl
                            )
                        }

                        if(responseInfo.canFulfillIntent) {
                            responseBuilder.withCanFulfillIntent(responseInfo.canFulfillIntent);
                        }

                        return responseBuilder
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

                const requestBody = req.body as RequestEnvelope;
                skill.invoke(requestBody)
                .then((responseBody) => {
                    const msg = {
                        payload: responseBody
                    }

                    const statusCode = 200;
                    res.status(statusCode).jsonp(msg.payload);
                })
                .catch((error) => {
                    console.error(error);
                    res.status(500).json('Error during the request');
                });
                // Just for test. TODO: build response from sdk.
                
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