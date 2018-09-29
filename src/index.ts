import { Red } from "node-red";
import * as AlexaSpeak from "./nodes/alexa-speak/alexa-speak";
import * as AlexaConfig from "./nodes/alexa-config/alexa-config";
import * as AlexaRequest from "./nodes/alexa-request/alexa-request";
import * as AlexaResponse from "./nodes/alexa-response/alexa-response";

module.exports = (RED: Red) => {
    AlexaConfig.register(RED);
    //ValidateRequest.register(RED);
    // ProcessRequest.register(RED);
    // ProcessResponse.register(RED);
    AlexaSpeak.register(RED);
    AlexaRequest.register(RED);
    AlexaResponse.register(RED);
}