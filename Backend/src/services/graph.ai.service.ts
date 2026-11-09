import { Annotation, StateGraph, START, END } from "@langchain/langgraph";
import { HumanMessage, BaseMessage } from "@langchain/core/messages";
import { createAgent, providerStrategy } from "langchain";
import { googleModel, googleLiteModel, mistralModel, mistralFallbackModel, cohereModel } from "./models.service.js";
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
        .catch(async (err) => {
            console.warn("Primary Mistral (Codestral) invocation warning, attempting fallback to open-mistral-7b:", err?.message || err);
            try {
                const fallbackRes = await mistralFallbackModel.invoke(prompt);
                return String(fallbackRes.content);
            } catch (fallbackErr: any) {
                console.error("Mistral AI Invocation Error:", fallbackErr);
                return `[Mistral AI error: Unable to generate response. ${fallbackErr.message || String(fallbackErr)}]`;
            }
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

const FlexibleJudgeSchema = z.object({
    solution_1_score: z.union([z.number(), z.string()]).describe("Score from 0 to 10 for Solution 1"),
    solution_2_score: z.union([z.number(), z.string()]).describe("Score from 0 to 10 for Solution 2"),
    winner: z.string().describe("Winner: 'Solution-1' or 'Solution-2'"),
    reasoning: z.string().describe("2-3 sentences explaining why the winner prevailed"),
});

const normalizeVerdict = (raw: any): { winner: string; reasoning: string; solution_1_score: number; solution_2_score: number } => {
    let winner = "Solution-1";
    const rawWinner = String(raw?.winner || "").trim().toLowerCase();
    if (rawWinner.includes("solution-2") || rawWinner.includes("solution 2") || rawWinner.includes("cohere")) {
        winner = "Solution-2";
    } else if (rawWinner.includes("tie") || rawWinner.includes("draw")) {
        winner = "Tie";
    }

    const s1 = typeof raw?.solution_1_score === "number" ? raw.solution_1_score : parseFloat(String(raw?.solution_1_score));
    const s2 = typeof raw?.solution_2_score === "number" ? raw.solution_2_score : parseFloat(String(raw?.solution_2_score));

    return {
        winner,
        reasoning: String(raw?.reasoning || "Both contenders provided strong solutions."),
        solution_1_score: isNaN(s1) ? 8 : Math.min(10, Math.max(0, s1)),
        solution_2_score: isNaN(s2) ? 8 : Math.min(10, Math.max(0, s2)),
    };
};

const judgeNode = async (state: GraphState) => {
    const { solution_1, solution_2, messages } = state;
    const promptList = messages.map((m) => String(m.content)).join("\n");

    const refereeEvaluationPrompt = `You are a strict, decisive AI referee evaluating a battle between two AI models.

The user asked:
"${promptList}"

Here are the two solutions:

Solution 1 (Mistral Codestral):
${solution_1}

Solution 2 (Cohere Command-A):
${solution_2}

CRITICAL REFEREE RULES:
1. You MUST be decisive and pick a clear winner ("Solution-1" or "Solution-2") in almost every battle. Look closely for nuances: code cleanliness, efficiency, clarity, formatting, handling of edge cases, or conciseness.
2. Give a score (0-10) for each solution.
3. Provide a clear, sharp 2-3 sentence reasoning explaining why the winner prevailed.`;

    // Attempt 1: Primary Google Gemini Model (gemini-3.5-flash)
    try {
        const judge = createAgent({
            model: googleModel,
            tools: [],
            responseFormat: providerStrategy(FlexibleJudgeSchema),
        });

        const judgeResponse = await judge.invoke({
            messages: [new HumanMessage(refereeEvaluationPrompt)],
        });

        if (judgeResponse?.structuredResponse) {
            return {
                judge: normalizeVerdict(judgeResponse.structuredResponse),
            };
        }
    } catch (err: any) {
        console.warn("Primary Google Gemini Judge Error, attempting Gemini Lite:", err?.message || err);
    }

    // Attempt 2: Secondary Google Gemini Lite Model (gemini-3.5-flash-lite)
    try {
        const judgeLite = createAgent({
            model: googleLiteModel,
            tools: [],
            responseFormat: providerStrategy(FlexibleJudgeSchema),
        });

        const judgeResponse = await judgeLite.invoke({
            messages: [new HumanMessage(refereeEvaluationPrompt)],
        });

        if (judgeResponse?.structuredResponse) {
            return {
                judge: normalizeVerdict(judgeResponse.structuredResponse),
            };
        }
    } catch (err: any) {
        console.warn("Secondary Google Gemini Lite Judge Error, attempting Mistral JSON referee:", err?.message || err);
    }

    // Attempt 3: Mistral Direct JSON Evaluation
    try {
        const jsonPrompt = `${refereeEvaluationPrompt}

Return ONLY a valid JSON object without markdown fences, explanation, or extra keys:
{
  "solution_1_score": <number 0-10>,
  "solution_2_score": <number 0-10>,
  "winner": "Solution-1" or "Solution-2",
  "reasoning": "<concise explanation>"
}`;

        const fallbackResponse = await mistralModel.invoke([new HumanMessage(jsonPrompt)]);
        const rawText = String(fallbackResponse.content).replace(/```json|```/g, "").trim();
        const parsed = JSON.parse(rawText);

        if (parsed.winner && typeof parsed.reasoning === "string") {
            return {
                judge: normalizeVerdict(parsed),
            };
        }
    } catch (fallbackErr) {
        console.error("Mistral JSON Fallback Referee Error:", fallbackErr);
    }

    // Default safe verdict if all referee attempts fail
    return {
        judge: {
            winner: "Solution-1",
            reasoning: "Both contenders completed solution generation. Fallback evaluation applied.",
            solution_1_score: 9,
            solution_2_score: 8,
        },
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
            new HumanMessage(userMessage),
        ],
    });
    return result;
}
