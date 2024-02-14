import { PDFLoader } from "langchain/document_loaders/fs/pdf";
import { NextRequest, NextResponse } from "next/server";

//import { Pinecone } from "@pinecone-database/pinecone";

import { PineconeClient } from "@pinecone-database/pinecone";

import { OpenAIEmbeddings } from "langchain/embeddings/openai";
//import { HuggingFaceInferenceEmbeddings } from "langchain/embeddings/hf";
import { PineconeStore } from "langchain/vectorstores/pinecone";

import { process } from '/env';
//dotenv.config();

export async function POST(request: NextRequest) {
  // Extract FormData from the request
  const data = await request.formData();
  // Extract the uploaded file from the FormData
  const file: File | null = data.get("file") as unknown as File;

  // Make sure file exists
  if (!file) {
    return NextResponse.json({ success: false, error: "No file found" });
  }

  // Make sure file is a PDF
  if (file.type !== "application/pdf") {
    return NextResponse.json({ success: false, error: "Invalid file type" });
  }

  // Use the PDFLoader to load the PDF and split it into smaller documents
  const pdfLoader = new PDFLoader(file);
  const splitDocuments = await pdfLoader.loadAndSplit();




  // Initialize the Pinecone client

/*
const pinecone = new Pinecone();  

await pinecone.init({      
	environment: "gcp-starter",      
	apiKey: "a672c805-0bb3-4dcf-b4c9-d511c17b5474",      
});      
const index = pinecone.Index("vdbchatp");

*/


  const pineconeClient = new PineconeClient();
  await pineconeClient.init({
    apiKey: process.env.PINECONE_API_KEY ?? "",
    environment: "gcp-starter",
  });
  
  const pineconeIndex = pineconeClient.Index(
    process.env.PINECONE_INDEX_NAME as string
  );
  

  // Use Langchain's integration with Pinecone to store the documents
  await PineconeStore.fromDocuments(splitDocuments, new HuggingFaceInferenceEmbeddings(), {pineconeIndex,
  });

  return NextResponse.json({ success: true });
}