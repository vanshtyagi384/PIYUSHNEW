import 'dotenv/config';
import { PDFLoader } from '@langchain/community/document_loaders/fs/pdf';
import { OpenAIEmbeddings } from '@langchain/openai';
import { QdrantVectorStore } from '@langchain/qdrant';
import readLatestFile from './readLatestFile.js';

async function init() {
  const latestfile = await readLatestFile('/Users/tyagipiyush/Desktop/GENAI/PIYUSHNEW/backend/uploads');
   if (!latestfile) {
    console.error('No file found to index.');
    return;
  }

  const loader = new PDFLoader(latestfile);
  const docs = await loader.load();

  const embeddings = new OpenAIEmbeddings({
    model: 'text-embedding-3-large',
  });

  const vectorStore = await QdrantVectorStore.fromDocuments(docs, embeddings, {
    url: 'http://localhost:6333',
    collectionName: 'chaicode-collection',
  });

  console.log('Indexing of documents done...');
}

init();