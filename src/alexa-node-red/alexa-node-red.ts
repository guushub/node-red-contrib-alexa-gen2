import { RequestEnvelope, ResponseEnvelope, Response, ui, canfulfill } from "ask-sdk-model";
import { AttributesManagerFactory, AttributesManager } from "ask-sdk-core";
import StandardCard = ui.StandardCard;

export interface Payload { 
    alexaRequest: RequestEnvelope,
    alexaResponse: ResponseEnvelope,
    alexaResponseBuilderInput?: AlexaResponseBuilderInput

}

export interface AlexaResponseBuilderInput {
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

export enum AlexaNodeRedRequestType {
    "LaunchRequest" = "LaunchRequest",
    "CanFulfillIntentRequest" = "CanFulfillIntentRequest",
    "IntentRequest" = "IntentRequest",
    "SessionEndedRequest" = "SessionEndedRequest",
    "AlexaError" = "AlexaError"
}