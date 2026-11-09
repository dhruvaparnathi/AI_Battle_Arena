import config from "../config/config.js";
import { ChatGoogle } from "@langchain/google";
import { ChatMistralAI } from "@langchain/mistralai";
import { ChatCohere } from "@langchain/cohere";

// Google Gemini models (Gemini 3.5 Flash is the primary referee)
export const googleModel = new ChatGoogle({
    apiKey: config.GEMINI_API_KEY,
    model: "gemini-3.5-flash",
    maxOutputTokens: 1200,
});

export const googleLiteModel = new ChatGoogle({
    apiKey: config.GEMINI_API_KEY,
    model: "gemini-3.5-flash-lite",
    maxOutputTokens: 1200,
});

// Mistral AI models (Codestral is cutting-edge for reasoning & code, with open-mistral-7b as fallback)
export const mistralModel = new ChatMistralAI({
    apiKey: config.MISTRAL_API_KEY,
    model: "codestral-latest",
    maxTokens: 1200,
});

export const mistralFallbackModel = new ChatMistralAI({
    apiKey: config.MISTRAL_API_KEY,
    model: "open-mistral-7b",
    maxTokens: 1200,
});

// Cohere model
export const cohereModel = new ChatCohere({
    apiKey: config.COHERE_API_KEY,
    model: "command-a-03-2025",
});
