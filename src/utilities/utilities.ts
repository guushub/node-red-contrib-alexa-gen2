import * as AlexaNodeRed from "../alexa-node-red/alexa-node-red";
import { HandlerInput } from "ask-sdk-core";

export class Utilities {
    static createResponseWrapper(res: any) {
        const wrapper = {
            _res: res
        };

        const toWrap = [
            "append",
            "attachment",
            "cookie",
            "clearCookie",
            "download",
            "end",
            "format",
            "get",
            "json",
            "jsonp",
            "links",
            "location",
            "redirect",
            "render",
            "send",
            "sendfile",
            "sendFile",
            "sendStatus",
            "set",
            "status",
            "type",
            "vary"
        ];
        toWrap.forEach(function(f) {
            wrapper[f] = function() {
                const result = res[f].apply(res,arguments);
                if (result === res) {
                    return wrapper;
                } else {
                    return result;
                }
            }
        });
        return wrapper;
    }

    static createRequestWrapper(req: any) {
        // This misses a bunch of properties (eg headers). Before we use this function
        // need to ensure it captures everything documented by Express and HTTP modules.
        const wrapper = {
            _req: req
        };
        const toWrap = [
            "param",
            "get",
            "is",
            "acceptsCharset",
            "acceptsLanguage",
            "app",
            "baseUrl",
            "body",
            "cookies",
            "fresh",
            "hostname",
            "ip",
            "ips",
            "originalUrl",
            "params",
            "path",
            "protocol",
            "query",
            "route",
            "secure",
            "signedCookies",
            "stale",
            "subdomains",
            "xhr",
            "socket" // TODO: tidy this up
        ];
        toWrap.forEach(function(f) {
            if (typeof req[f] === "function") {
                wrapper[f] = function() {
                    const result = req[f].apply(req,arguments);
                    if (result === req) {
                        return wrapper;
                    } else {
                        return result;
                    }
                }
            } else {
                wrapper[f] = req[f];
            }
        });


        return wrapper;
    }

    static getSessionAttributes = (handlerInput: AlexaNodeRed.ExtendedHandlerInput, isError: boolean, shouldRespond: boolean) => {
        let sessionAttributes: AlexaNodeRed.SessionAttributes = {
            isError: null,
            shouldRespond: null
        };
        if(handlerInput.requestEnvelope.alexaNodeRedSessionAttributes) {
            sessionAttributes = handlerInput.requestEnvelope.alexaNodeRedSessionAttributes;
        }
        sessionAttributes.isError = isError;
        sessionAttributes.shouldRespond = shouldRespond;

        return sessionAttributes;
    }
    
    static getResponseBuilder = (handlerInput : HandlerInput, alexaNodeRedSessionAttributes: AlexaNodeRed.SessionAttributes) => {
        handlerInput.attributesManager.setSessionAttributes({alexaNodeRedSessionAttributes: alexaNodeRedSessionAttributes});
        let responseBuilder = handlerInput.responseBuilder;
        if(!alexaNodeRedSessionAttributes) {
            return responseBuilder.withShouldEndSession(true);
        }
    
        responseBuilder = responseBuilder.withShouldEndSession(alexaNodeRedSessionAttributes.withShouldEndSession === true);
    
        if(alexaNodeRedSessionAttributes.speachOutput) {
            responseBuilder = responseBuilder.speak(alexaNodeRedSessionAttributes.speachOutput);
        }
    
        if(alexaNodeRedSessionAttributes.card) {
            responseBuilder = responseBuilder.withSimpleCard(
                alexaNodeRedSessionAttributes.card.cardTitle, 
                alexaNodeRedSessionAttributes.card.cardContent
            );
        }
    
        if(alexaNodeRedSessionAttributes.card && (alexaNodeRedSessionAttributes.card.smallImageUrl || alexaNodeRedSessionAttributes.card.largeImageUrl)) {
            responseBuilder = responseBuilder.withStandardCard(
                alexaNodeRedSessionAttributes.card.cardTitle, 
                alexaNodeRedSessionAttributes.card.cardContent,
                alexaNodeRedSessionAttributes.card.smallImageUrl,
                alexaNodeRedSessionAttributes.card.largeImageUrl
            )
        }
    
        if(alexaNodeRedSessionAttributes.canFulfillIntent) {
            responseBuilder = responseBuilder.withCanFulfillIntent(alexaNodeRedSessionAttributes.canFulfillIntent);
        }
    
        return responseBuilder;
    }
    
}

