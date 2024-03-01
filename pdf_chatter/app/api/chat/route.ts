import { NextRequest } from "next/server";
import { PineconeClient } from "@pinecone-database/pinecone";
import { PineconeStore } from "langchain/vectorstores/pinecone";

//import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { HuggingFaceInferenceEmbeddings } from "langchain/embeddings/hf";

import { OpenAI } from "langchain/llms/openai";
import { HuggingFaceInference } from "langchain/llms/hf";
import { VectorDBQAChain } from "langchain/chains";
import { StreamingTextResponse, LangChainStream } from "ai"; //??? who is ai here? Vercel?
import { CallbackManager } from "langchain/callbacks";

/// for the Newly added/ Rectified Chain

import {
  ConversationalRetrievalQAChain,
} from "langchain/chains";
import { BufferMemory } from "langchain/memory";



export async function POST(request: NextRequest) {
  // Parse the POST request's JSON body
  const body = await request.json();
  
  // Use Vercel's `ai` package to setup a stream // a stream? -> (vdb clien | vdb | llm | init chain then call thee chain with query???)
  const { stream, handlers } = LangChainStream();

  
  // Initialize Pinecone Client
  const pineconeClient = new PineconeClient();

  await pineconeClient.init({
    apiKey: process.env.PINECONE_API_KEY ?? "",
    environment: "gcp-starter",
  });

  const pineconeIndex = pineconeClient.Index(
    process.env.PINECONE_INDEX_NAME as string
  );

  // Initialize our vector store
  const vectorStore = await PineconeStore.fromExistingIndex(
    new HuggingFaceInferenceEmbeddings({apiKey:process.env.HggFM_API_KEY}),
    { pineconeIndex }
  );

// Specify the OpenAI model we'd like to use, and turn on streaming
const model = new OpenAI({
  modelName: "gpt-3.5-turbo",
  streaming: true,
  callbacks: [handlers],
  openAIApiKey: "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",
});
  const chain = ConversationalRetrievalQAChain.fromLLM(
    model,
    vectorStore.asRetriever(),
    {
      returnSourceDocuments: true,
      memory: new BufferMemory({
        memoryKey: "chat_history",
        inputKey: "question", // The key for the input to the chain
        outputKey: "text", // The key for the final conversational output of the chain
      }),
    }
  );

  // Get a streaming response from our chain with the prompt given by the user
  chain.stream({ question:body.prompt });


  // Return an output stream to the frontend
  return new StreamingTextResponse(stream);


}
// initiate the streamer ??? .... , --->>> stream handler ?
// initiate vdb client
//upload the pdf to vdb/vstore
// initialize the vstore | model | the chain
// call the chain .... query!