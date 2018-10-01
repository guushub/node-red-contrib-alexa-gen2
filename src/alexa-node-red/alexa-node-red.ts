import { RequestHandler, HandlerInput, ErrorHandler } from "ask-sdk-core";
import { RequestEnvelope, ResponseEnvelope, Response, canfulfill } from "ask-sdk-model";
import { Utilities } from "../utilities/utilities";

export const LaunchRequest: RequestHandler = {
    canHandle: (handlerInput : ExtendedHandlerInput) : boolean => {
        return handlerInput.requestEnvelope.request.type === RequestType.LaunchRequest
    },
    handle: (handlerInput : ExtendedHandlerInput) : Response => {
        const sessionAttributes = Utilities.getSessionAttributes(handlerInput, false, true);
        const responseBuilder = Utilities.getResponseBuilder(handlerInput, sessionAttributes);
        const response = responseBuilder.getResponse();
        
        return response;
    },
}

export const CanFulfillIntentRequest: RequestHandler = {
    canHandle: (handlerInput : ExtendedHandlerInput) : boolean => {
        return handlerInput.requestEnvelope.request.type === RequestType.CanFulfillIntentRequest
    },
    handle: (handlerInput : ExtendedHandlerInput) : Response => {
        const sessionAttributes = Utilities.getSessionAttributes(handlerInput, false, true);
        const responseBuilder = Utilities.getResponseBuilder(handlerInput, sessionAttributes);
        const response = responseBuilder.getResponse();
        return response;
    },
}

export const IntentRequest: RequestHandler = {
    canHandle: (handlerInput : ExtendedHandlerInput) : boolean => {
        return handlerInput.requestEnvelope.request.type === RequestType.IntentRequest;
    },
    handle: (handlerInput : ExtendedHandlerInput) : Response => {
        const sessionAttributes = Utilities.getSessionAttributes(handlerInput, false, true);
        const responseBuilder = Utilities.getResponseBuilder(handlerInput, sessionAttributes);
        const response = responseBuilder.getResponse();
        return response;
    },
}

export const SessionEndedRequest: RequestHandler = {
    canHandle: (handlerInput : ExtendedHandlerInput) : boolean => {
        return handlerInput.requestEnvelope.request.type === RequestType.SessionEndedRequest
    },
    handle: (handlerInput : ExtendedHandlerInput) : Response => {
        const sessionAttributes = Utilities.getSessionAttributes(handlerInput, false, false);
        const responseBuilder = Utilities.getResponseBuilder(handlerInput, sessionAttributes);
        const response = responseBuilder.getResponse();
        return response;
    },
}

export const AlexaNodeRedErrorHandler: ErrorHandler = {
    canHandle(handlerInput : ExtendedHandlerInput, error : Error) : boolean {
        return error.name.startsWith('AskSdk');
    },
    handle(handlerInput : ExtendedHandlerInput, error : Error) {
        const sessionAttributes = Utilities.getSessionAttributes(handlerInput, true, true);
        sessionAttributes.speachOutput = sessionAttributes.speachOutput ? sessionAttributes.speachOutput : 'An error was encountered while handling your request. Try again later'
        const responseBuilder = Utilities.getResponseBuilder(handlerInput, sessionAttributes);
        const response = responseBuilder.getResponse();
        return response;
    },
};


export interface ExtendedHandlerInput extends HandlerInput {
    requestEnvelope: ExtendedRequestEnvelope
}

export interface ExtendedRequestEnvelope extends RequestEnvelope {
    alexaNodeRedSessionAttributes: SessionAttributes
}


export interface Payload { 
    alexaRequest: RequestEnvelope,
    alexaResponse: ResponseEnvelope,
}

export interface SessionAttributes {
    isError: boolean, 
    shouldRespond: boolean,
    speachOutput?: string,
    card?: {
        cardTitle: string, 
        cardContent: string, 
        smallImageUrl?: string, 
        largeImageUrl?: string
    },
    withShouldEndSession?: boolean,
    canFulfillIntent?: canfulfill.CanFulfillIntent
}

export enum RequestType {
    "LaunchRequest" = "LaunchRequest",
    "CanFulfillIntentRequest" = "CanFulfillIntentRequest",
    "IntentRequest" = "IntentRequest",
    "SessionEndedRequest" = "SessionEndedRequest",
    "AlexaError" = "AlexaError"
}