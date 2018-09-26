import { Red } from "node-red";
// import * as ProcessRequest from "./nodes/process-request/process-request";
// import * as ProcessResponse from "./nodes/process-response/process-response";
// import * as ValidateRequest from "./nodes/validate-request/validate-request";
import * as Say from "./nodes/say/say";

import * as AlexaConfig from "./nodes/alexa-config/alexa-config";
import * as AlexaRequest from "./nodes/alexa-request/alexa-request";
import * as AlexaResponse from "./nodes/alexa-response/alexa-response";

module.exports = (RED: Red) => {
    AlexaConfig.register(RED);
    //ValidateRequest.register(RED);
    // ProcessRequest.register(RED);
    // ProcessResponse.register(RED);
    Say.register(RED);
    AlexaRequest.register(RED);
    AlexaResponse.register(RED);
}