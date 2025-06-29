// seedAgendaVectors.ts
import { ChromaClient } from "chromadb";
import OpenAI from "openai";
import fs from "fs";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

const agendas = JSON.parse(fs.readFileSync("./agendas.json", "utf8"));

async function seed() {
  const client = new ChromaClient();
  const collection = await client.getOrCreateCollection({ name: "outreach_agendas" });

  for (const agenda of agendas) {
    const embedding = await openai.embeddings.create({
      model: "text-embedding-3-small",
      input: agenda.text,
    });

    await collection.add({
      ids: [agenda.id],
      documents: [agenda.text],
      embeddings: [embedding.data[0].embedding],
    });

    console.log(`Added agenda: ${agenda.id}`);
  }
}

seed();
