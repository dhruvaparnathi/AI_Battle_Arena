import config from "../config/config.js";
import { ChatGoogle } from "@langchain/google";
import { ChatMistralAI } from "@langchain/mistralai";
import { ChatCohere } from "@langchain/cohere";


export const googleModel = new ChatGoogle({
    apiKey: config.GEMINI_API_KEY,
    model: "gemini-flash-latest",
});

export const mistralModel = new ChatMistralAI({
    apiKey: config.MISTRAL_API_KEY,
    model: "mistral-medium-latest",
});

export const cohereModel = new ChatCohere({
    apiKey: config.COHERE_API_KEY,
    model: "command-a-03-2025",  
});

