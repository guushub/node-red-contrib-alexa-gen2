import { Red, NodeProperties } from "node-red";
import { SkillBuilders } from "ask-sdk";
import * as AlexaNodeRed from "../../alexa-node-red/alexa-node-red";

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

        this.on("input",function(msg: { res: any, req: any, payload: AlexaNodeRed.Payload }) {
            if (msg.res && msg.req) {
                const res = msg.res._res;
                const req = msg.req._req;
                res.set({
                    "Content-Type": "application/json;charset=UTF-8",
                    "Content-Length": ""
                });

                const skill = SkillBuilders.custom()
                      .addRequestHandlers(
                        AlexaNodeRed.LaunchRequest,
                        AlexaNodeRed.CanFulfillIntentRequest,
                        AlexaNodeRed.IntentRequest,
                        AlexaNodeRed.SessionEndedRequest
                      )         
                      .addErrorHandlers(
                        AlexaNodeRed.AlexaNodeRedErrorHandler
                      )
                      .create();

                const requestBody = req.body as AlexaNodeRed.ExtendedRequestEnvelope;
                requestBody.alexaNodeRedSessionAttributes = msg.payload.alexaResponse.sessionAttributes.alexaNodeRedSessionAttributes;
                requestBody.alexaNodeRedSessionAttributes.withShouldEndSession = config.shouldEndSession;
                skill.invoke(requestBody)
                .then((responseBody) => {
                    if(!responseBody.sessionAttributes || !responseBody.sessionAttributes.alexaNodeRedSessionAttributes) {
                        res.status(500).jsonp('Error during the request. Unknown session attributes');
                        return;
                    }

                    const sessionAttributes: AlexaNodeRed.SessionAttributes = responseBody.sessionAttributes.alexaNodeRedSessionAttributes;
                    if(sessionAttributes.isError && sessionAttributes.shouldRespond) {
                        res.status(200).jsonp(responseBody);
                        return;
                    }

                    if(sessionAttributes.shouldRespond) {
                        
                    }
                    delete responseBody.sessionAttributes.alexaNodeRedSessionAttributes;
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
                
            } else {
                node.warn((RED as any)._("httpin.errors.no-response"));
            }
        });

    }

    RED.nodes.registerType("alexa response", AlexaResponse);
}