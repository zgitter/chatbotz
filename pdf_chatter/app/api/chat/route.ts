import { NextRequest } from "next/server";
import { PineconeClient } from "@pinecone-database/pinecone";
import { PineconeStore } from "langchain/vectorstores/pinecone";


//import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { HuggingFaceInferenceEmbeddings } from "langchain/embeddings/hf";


//import { OpenAI } from "langchain/llms/openai";
import { HuggingFaceInference } from "langchain/llms/hf";
import { VectorDBQAChain } from "langchain/chains";
import { StreamingTextResponse, LangChainStream } from "ai"; //??? who is ai here? Vercel?
import { CallbackManager } from "langchain/callbacks";

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
    new HuggingFaceInferenceEmbeddings(),
    { pineconeIndex }
  );

  // Specify the hggf/OpenAI model we'd like to use, and turn on streaming
   

const model = new HuggingFaceInference({
  model: "gpt2",
  apiKey: process.env.HggFM_API_KEY,
  //streaming: true,
  callbackManager: CallbackManager.fromHandlers(handlers),
});

//const res = await model.call("1 + 1 =");
//console.log({ res });

  // Define the Langchain chain?
  const chain = VectorDBQAChain.fromLLM(model, vectorStore, {
    k: 1,
    returnSourceDocuments: true,
  });

  // Call our chain with the prompt given by the user
  chain.call({ query: body.prompt }).catch(console.error);

  // Return an output stream to the frontend
  return new StreamingTextResponse(stream);
}
// inti the streamer ??? .... ,stream handler ?
// intit vdb client
//upload the pdf to vdb/vstore)
// initilize the vstore | model | the chain
// call the chain .... query!