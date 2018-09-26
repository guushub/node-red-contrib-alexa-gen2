import { RequestEnvelope, ResponseEnvelope, Response, ui, canfulfill } from "ask-sdk-model";
import { AttributesManagerFactory, AttributesManager } from "ask-sdk-core";
import StandardCard = ui.StandardCard;

export interface Payload { 
    alexaRequest: RequestEnvelope,
    alexaResponse: ResponseEnvelope
}




export enum AlexaNodeRedRequestType {
    "LaunchRequest" = "LaunchRequest",
    "CanFulfillIntentRequest" = "CanFulfillIntentRequest",
    "IntentRequest" = "IntentRequest",
    "SessionEndedRequest" = "SessionEndedRequest",
    "AlexaError" = "AlexaError"
}