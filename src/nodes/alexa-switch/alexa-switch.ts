import { Red, Node, NodeProperties } from "node-red";
import * as AlexaNodeRed from "../../alexa-node-red/alexa-node-red";
import { IntentRequest, Slot } from "ask-sdk-model";

interface AlexaSwitchNodeProperties extends NodeProperties {
    intentName: string;
    slotName: string;
    slotValues: string[];
    outputs: number;
}

interface AlexaSwitchNode extends Node, AlexaSwitchNodeProperties {}

//TODO: take into account the slot types. For instance; dates.
export function register(RED: Red) {
    const AlexaSwitch = function(config: AlexaSwitchNodeProperties) {
        const node: AlexaSwitchNode = this;
        RED.nodes.createNode(node, config);
        node.outputs = config.outputs;
        node.intentName = config.intentName;
        node.slotName = config.slotName;
        node.slotValues = config.slotValues;
    
        node.on('input', function(msg: { payload: AlexaNodeRed.Payload }) {
            const requestType = msg.payload.alexaRequest.request.type;
            if(requestType !== AlexaNodeRed.RequestType.IntentRequest) {
                return;
            }

            const intent = (msg.payload.alexaRequest.request as IntentRequest).intent;
            if(intent.name.toLowerCase() !== node.intentName.toLowerCase() || !intent.slots) {
                return;
            }

            let slot: Slot;
            for (const slotName in intent.slots) {
                if (intent.slots.hasOwnProperty(slotName)) {
                    if(slotName.toLowerCase() === node.slotName.toLowerCase()) {
                        slot = intent.slots[slotName];
                        break;
                    }                   
                }
            }
            
            if(!slot) {
                return;
            }

            const msgPack = node.slotValues.map(slotValue => {
                //TODO: is slot.value really always of type string?
                if(slotValue.toLowerCase() === slot.value.toLowerCase()) {
                    return msg;
                } else {
                    return null;
                }
                
            })
            
            node.send(msgPack);
        });
    }

    RED.nodes.registerType("alexa switch", AlexaSwitch);
}