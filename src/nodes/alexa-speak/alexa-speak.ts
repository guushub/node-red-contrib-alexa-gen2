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
            msg.payload.alexaResponseBuilderInput = {
                speachOutput: speech
            }
            node.send(msg);
        });
    }

    RED.nodes.registerType("alexa speak", AlexaSpeak);
}