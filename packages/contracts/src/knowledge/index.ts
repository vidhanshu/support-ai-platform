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
