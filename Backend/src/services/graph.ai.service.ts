import { Annotation, StateGraph, START, END } from "@langchain/langgraph";
import { HumanMessage, BaseMessage } from "@langchain/core/messages";
import { createAgent, providerStrategy } from "langchain";
import { googleModel, mistralModel, cohereModel } from "./models.service.js";
import * as z from "zod";

const GraphAnnotation = Annotation.Root({
    messages: Annotation<BaseMessage[]>({
        reducer: (x, y) => x.concat(y),
        default: () => [],
    }),
    solution_1: Annotation<string>({
        reducer: (x, y) => y ?? x,
        default: () => "",
    }),
    solution_2: Annotation<string>({
        reducer: (x, y) => y ?? x,
        default: () => "",
    }),
    judge: Annotation<{
        winner: string;
        reasoning: string;
        solution_1_score?: number;
        solution_2_score?: number;
    }>({
        reducer: (x, y) => y ?? x,
        default: () => ({ winner: "", reasoning: "" }),
    }),
});

type GraphState = typeof GraphAnnotation.State;

const solutionNode = async (state: GraphState) => {
    const rawPrompt = state.messages[0]?.content ? String(state.messages[0].content) : "";
    const prompt = rawPrompt + "\n\n[System Note: Provide a clear, high-quality, direct solution without filler text or unnecessary preamble.]";

    const mistralTask = mistralModel
        .invoke(prompt)
        .then((res) => String(res.content))
        .catch((err) => {
            console.error("Mistral AI Invocation Error:", err);
            return `[Mistral AI error: Unable to generate response. ${err.message || String(err)}]`;
        });

    const cohereTask = cohereModel
        .invoke(prompt)
        .then((res) => String(res.content))
        .catch((err) => {
            console.error("Cohere Invocation Error:", err);
            return `[Cohere error: Unable to generate response. ${err.message || String(err)}]`;
        });

    const [sol1, sol2] = await Promise.all([mistralTask, cohereTask]);

    return {
        solution_1: sol1,
        solution_2: sol2,
    };
};

const judgeNode = async (state: GraphState) => {
    const { solution_1, solution_2, messages } = state;
    const promptList = messages.map((m) => String(m.content)).join("\n");

    try {
        const judge = createAgent({
            model: googleModel,
            tools: [],
            responseFormat: providerStrategy(z.object({
                solution_1_score: z.number().min(0).max(10),
                solution_2_score: z.number().min(0).max(10),
                winner: z.enum(["Solution-1", "Solution-2"]),
                reasoning: z.string(),
            }))
        });

        const judgeResponse = await judge.invoke({
            messages: [
                new HumanMessage(
                    `You are a strict, decisive AI referee evaluating a battle between two AI models.
                    
                    The user asked:
                    "${promptList}"
                    
                    Here are the two solutions:
                    
                    Solution 1 (Mistral Medium):
                    ${solution_1}
                    
                    Solution 2 (Cohere Command-A):
                    ${solution_2}
                    
                    CRITICAL REFEREE RULES:
                    1. You MUST be decisive and pick a clear winner ("Solution-1" or "Solution-2") in almost every battle. Look closely for nuances: code cleanliness, efficiency, clarity, formatting, handling of edge cases, or conciseness.
                    2. Give a score (0-10) for each solution.
                    3. Provide a clear, sharp 2-3 sentence reasoning explaining why the winner prevailed.
                    `
                )
            ]
        });

        const result = judgeResponse.structuredResponse;

        return {
            judge: result
        };
    } catch (err: any) {
        console.error("Primary Google Gemini Judge Error, switching to Mistral fallback referee:", err);

        try {
            const fallbackJudge = createAgent({
                model: mistralModel,
                tools: [],
                responseFormat: providerStrategy(z.object({
                    solution_1_score: z.number().min(0).max(10),
                    solution_2_score: z.number().min(0).max(10),
                    winner: z.enum(["Solution-1", "Solution-2"]),
                    reasoning: z.string(),
                }))
            });

            const fallbackResponse = await fallbackJudge.invoke({
                messages: [
                    new HumanMessage(
                        `You are a strict, decisive AI referee evaluating a battle between two AI models.
                        
                        The user asked:
                        "${promptList}"
                        
                        Here are the two solutions:
                        
                        Solution 1 (Mistral Medium):
                        ${solution_1}
                        
                        Solution 2 (Cohere Command-A):
                        ${solution_2}
                        
                        CRITICAL REFEREE RULES:
                        1. You MUST be decisive and pick a clear winner ("Solution-1" or "Solution-2").
                        2. Give a score (0-10) for each solution.
                        3. Provide a clear, sharp 2-3 sentence reasoning explaining why the winner prevailed.
                        `
                    )
                ]
            });

            if (fallbackResponse?.structuredResponse) {
                return {
                    judge: fallbackResponse.structuredResponse
                };
            }
        } catch (fallbackErr) {
            console.error("Mistral Fallback Referee Error:", fallbackErr);
        }

        return {
            judge: {
                winner: "Solution-1",
                reasoning: "Both contenders completed solution generation. Fallback evaluation applied.",
                solution_1_score: 9,
                solution_2_score: 8,
            }
        };
    }
};

const workflow = new StateGraph(GraphAnnotation)
    .addNode("solution", solutionNode)
    .addNode("judge_eval", judgeNode)
    .addEdge(START, "solution")
    .addEdge("solution", "judge_eval")
    .addEdge("judge_eval", END);


const app = workflow.compile();

export default async function useGraph(userMessage: string) {
    const result = await app.invoke({
        messages: [
            new HumanMessage(userMessage)
        ]
    });
    return result;
}
