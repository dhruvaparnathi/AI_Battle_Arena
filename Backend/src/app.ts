import express from 'express';
import cors from 'cors';
import useGraph from "./services/graph.ai.service.js";

const app = express();

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
    res.send('Hello World!');
});


app.post("/ai/graph", async(req, res) => {
    try {
        const {userMessage} = req.body;
        if(!userMessage){
            return res.status(400).json({
                success: false,
                message: "Please provide user message"
            })
        }
        const result = await useGraph(userMessage);
        return res.status(200).json({
            success: true,
            message: "AI Graph Service",
            data: result
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Error while calling AI Graph Service",
            error: error
        })
    }
})

export default app;
