/** Document-level metadata stored on KnowledgeSource.metadata */
export interface KnowledgeSourceMetadata {
  title?: string;
  pageCount?: number;
  language?: string;
  author?: string;
  createdAt?: string;
  modifiedAt?: string;
}

/** Chunk-level metadata for citations */
export interface ChunkMetadata {
  pageNumber?: number;
}

export interface ExtractedPage {
  text: string;
  pageNumber: number;
}

export interface ExtractedDocument {
  pages: ExtractedPage[];
  metadata: KnowledgeSourceMetadata;
}

export interface Chunk {
  text: string;
  index: number;
  metadata?: ChunkMetadata;
}

export interface EmbeddedChunk extends Chunk {
  embedding: number[];
  tokenCount: number;
}

/** Chunk returned from retrieval for prompting + citations */
export interface RetrievedChunk {
  id: string;
  text: string;
  chunkIndex: number;
  knowledgeSourceId: string;
  /** Cosine similarity in [0, 1] (higher is better) */
  score: number;
  pageNumber?: number;
  title?: string;
  metadata?: ChunkMetadata | null;
}
