import { Red, NodeProperties, Node } from "node-red";

interface AlexaConfigNodeProperties extends NodeProperties {
    url: string;
}

export interface AlexaConfigNode extends Node, AlexaConfigNodeProperties {}

export function register(RED: Red) {
    const AlexaConfig = function (config: AlexaConfigNodeProperties) {   
        RED.nodes.createNode(this, config);
        this.url = config.url;
    }

    RED.nodes.registerType("alexa-skill-endpoint", AlexaConfig);
}