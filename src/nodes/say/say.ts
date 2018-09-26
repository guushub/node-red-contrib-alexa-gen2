import { Red, Node, NodeProperties } from "node-red";
import * as AlexaNodeRed from "../../alexa-node-red/alexa-node-red";

interface SayNodeProperties extends NodeProperties {
    speech: string;
}

export function register(RED: Red) {
    const Say = function(config: SayNodeProperties) {
        const node: Node = this;
        RED.nodes.createNode(node, config);
    
        node.on('input', function(msg: { payload: AlexaNodeRed.Payload }) {
            // const handlerInput = AlexaNodeRed.handlerInput(msg.payload);
            // const speech = config.speech;
            // const response = handlerInput.responseBuilder.speak(speech).getResponse();
            // msg.payload.responseEnvelope.response = response;
            // node.send(msg);
        });
    }

    RED.nodes.registerType("say", Say);
}