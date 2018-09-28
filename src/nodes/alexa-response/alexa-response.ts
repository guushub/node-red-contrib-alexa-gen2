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