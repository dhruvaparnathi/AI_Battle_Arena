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
    const prompt = state.messages[0]?.content ? String(state.messages[0].content) : "";

    const [mistralResult, cohereResult] = await Promise.all([
        mistralModel.invoke(prompt),
        cohereModel.invoke(prompt),
    ]);

    return {
        solution_1: String(mistralResult.content),
        solution_2: String(cohereResult.content),
    };
};

const judgeNode = async (state: GraphState) => {
    const { solution_1, solution_2, messages } = state;
    const promptList = messages.map((m) => String(m.content)).join("\n");

    const judge = createAgent({
        model: googleModel,
        tools: [],
        responseFormat: providerStrategy(z.object({
            solution_1_score: z.number().min(0).max(10),
            solution_2_score: z.number().min(0).max(10),
            winner: z.enum(["Solution-1", "Solution-2", "Tie"]),
            reasoning: z.string(),
        }))
    });

    const judgeResponse = await judge.invoke({
        messages: [
            new HumanMessage(
                `You are a judge tasked with evaluating two solutions to a user's problem.
                
                The user asked:
                
                "${promptList}"
                
                Here are the two solutions:
                
                Solution 1: ${solution_1}
                
                Solution 2: ${solution_2}
                
                Please evaluate which solution better addresses the user's problem and provide a score for each solution (0-10), a detailed reasoning, and a winner ("Solution-1", "Solution-2", or "Tie").
                
                CRITICAL JUDGING RULE:
                If both solutions have equal score/quality (or if solution_1_score === solution_2_score), you MUST set winner to "Tie".
                `
            )
        ]
    });

    const result = judgeResponse.structuredResponse;

    if (result && (result.solution_1_score === result.solution_2_score || result.winner === "Tie")) {
        result.winner = "Tie";
    }

    return {
        judge: result
    };
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