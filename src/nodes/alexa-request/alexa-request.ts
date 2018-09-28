import * as bodyParser from "body-parser";

import { Red, NodeProperties } from "node-red";

import { HandlerInput, RequestHandler, ErrorHandler, ResponseInterceptor } from 'ask-sdk-core';
import { Response, RequestEnvelope, ResponseEnvelope } from 'ask-sdk-model';
import { SkillBuilders } from "ask-sdk";

import { AlexaNodeRedRequestType }  from "../../alexa-node-red/alexa-node-red";
import { Utilities } from "../../utilities/utilities";


interface AlexaRequestNodeProperties extends NodeProperties {
    url: string; 
}

interface AlexaNodeRedResponse extends Response {
    isError?: boolean
}

interface AlexaNodeRedResponseEnvelope extends ResponseEnvelope {
    res
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
                    handlerInput.attributesManager.setSessionAttributes({
                        isError: false
                    });
                    const response: AlexaNodeRedResponse = handlerInput.responseBuilder
                    .getResponse()
                    
                    return response;
                },
            }
            
            const errorHandler: ErrorHandler = {
                canHandle(handlerInput : HandlerInput, error : Error) : boolean {
                    return error.name.startsWith('AskSdk');
                },
                handle(handlerInput : HandlerInput, error : Error) : AlexaNodeRedResponse {
                    handlerInput.attributesManager.setSessionAttributes({
                        isError: true
                    });
                    const response: AlexaNodeRedResponse = handlerInput.responseBuilder
                    .speak('An error was encountered while handling your request. Try again later')
                    .getResponse();
                    return response;

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
                    if(responseBody.sessionAttributes && responseBody.sessionAttributes.isError) {
                        res.status(200).jsonp(responseBody);
                        return;
                    }
                    const msg = {
                        req: Utilities.createRequestWrapper(req),
                        res: Utilities.createResponseWrapper(res), 
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