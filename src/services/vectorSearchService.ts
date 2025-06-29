import { ChromaClient } from "chromadb";
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });
const client = new ChromaClient();

let collectionPromise: Promise<any> | null = null;

async function getCollection() {
  if (!collectionPromise) {
    collectionPromise = client.getOrCreateCollection({ name: "outreach_agendas" });
  }
  return collectionPromise;
}

export async function getRelevantAgenda(emailBody: string): Promise<string> {
  const embeddingRes = await openai.embeddings.create({
    model: "text-embedding-3-small",
    input: emailBody,
  });

  const collection = await getCollection();

  const queryRes = await collection.query({
    queryEmbeddings: [embeddingRes.data[0].embedding],
    nResults: 1,
  });

  const doc = queryRes.documents?.[0]?.[0];
  return doc ?? "Thank the lead and ask how you can help.";
}
