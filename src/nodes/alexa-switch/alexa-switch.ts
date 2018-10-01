import { Red, Node, NodeProperties } from "node-red";
import * as AlexaNodeRed from "../../alexa-node-red/alexa-node-red";

interface AlexaSpeakNodeProperties extends NodeProperties {
    speech: string;
}

export function register(RED: Red) {
    const AlexaSpeak = function(config: AlexaSpeakNodeProperties) {
        const node: Node = this;
        RED.nodes.createNode(node, config);
    
        node.on('input', function(msg: { payload: AlexaNodeRed.Payload }) {
            const speech = config.speech;
            const sessionAttributes: AlexaNodeRed.SessionAttributes = msg.payload.alexaResponse.sessionAttributes.alexaNodeRedSessionAttributes;
            if(!sessionAttributes) {
                node.error("Expected alexaNodeRedSessionAttributes as property of response attributes.")
            }
            sessionAttributes.speachOutput = speech;
            node.send(msg);
        });
    }

    RED.nodes.registerType("alexa speak", AlexaSpeak);
}