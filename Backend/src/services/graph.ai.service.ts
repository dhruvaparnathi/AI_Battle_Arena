import { StateSchema, MessagesValue, StateGraph, START, END, ReducedValue } from "@langchain/langgraph";
import type { GraphNode } from "@langchain/langgraph";
import { createAgent, HumanMessage, providerStrategy } from "langchain";
import { googleModel, mistralModel, cohereModel } from "./models.service.js"
import * as z from 'zod';

const state = new StateSchema({
    messages: MessagesValue,
    solution_1: new ReducedValue(z.string().default(""),{
        reducer: (current, next)=>{
            return next
        },
    }),
    solution_2: new ReducedValue(z.string().default(""),{
        reducer: (current, next)=>{
            return next
        },
    }),
    judge: new ReducedValue(z.object({
        winner: z.string(),
        reasoning: z.string(),
    }).default({
        winner: "",
        reasoning: "",
    }),{
        reducer: (current, next)=>{
            return next
        },
    })
});

const solutionNode: GraphNode<typeof State> = async (state:typeof State)=>{
    console.log(state.messages);

    const [ mistralResult,cohereResult ]= await Promise.all([
        mistralModel.invoke(state.messages[0].text),
        cohereModel.invoke(state.messages[0].text),
    ])

    return {
        solution_1: mistralResult.text,
        solution_2: cohereResult.text
    };
    
}

const judgeNode: GraphNode<typeof State> = async(state:typeof State) =>{

    const { solution_1, solution_2 } = state;

    const judge = createAgent({
        model: googleModel,
        tools: [],
        responseFormat: providerStrategy(z.object({
            solution_1_score: z.number().min(0).max(10),
            solution_2_score: z.number().min(0).max(10),
            winner: z.enum(["Solution-1", "Solution-2"]),
            reasoning: z.string(),
        }))
    })

    const judgeResponse = await judge.invoke({
        messages: [
            new HumanMessage(
                `You are a judge tasked with evaluating two solutions to a user's problem.
                
                The user asked:
                
                "${state.messages.map((message) => message.text).join("\n")}"
                
                Here are the two solutions:
                
                Solution 1: ${state.solution_1}
                
                Solution 2: ${state.solution_2}
                
                Please evaluate which solution better addresses the user's problem and provide a score for each solution (0-10) and a winner.
                `
            )
        ]
    })

    const result = judgeResponse.structuredResponse

    return {
        judge_recommendation: result
    };
}

const graph = new StateGraph(state);
graph.addNode("solution", solutionNode);
graph.addNode("judge", judgeNode);
graph.addEdge(START, "solution");
graph.addEdge("solution", "judge");
graph.addEdge("judge", END);
graph.compile()

export default async function(userMessage:string){
    const result = await graph.invoke({
        messages:[
            new HumanMessage(userMessage)
        ]
    })
    return result.messages
}
// type JUDGEMENT = {
//     winner: "Solution-1" | "Solution-2";
//     reasoning: string;
// }

// type AIBATTLEARENA = {
//     messages: typeof MessagesValue;
//     solution_1: string;
//     solution_2: string;
//     Judgement: JUDGEMENT;
// }

// const state: AIBATTLEARENA = {
//     messages: MessagesValue,
//     solution_1: "",
//     solution_2: "",
//     Judgement: {
//         winner: "Solution-1",
//         solution_1_score: 0,
//         solution_2_score: 0,
//         reasoning: "",
//     }
// }