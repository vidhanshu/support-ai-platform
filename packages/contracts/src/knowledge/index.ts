export interface DocumentMetadata {
  pageCount?: number;
  pageNumber?: number;
  title?: string;
  language?: string;
  createdAt?: string;
  modifiedAt?: string;
}

export interface ExtractedDocument {
  text: string;
  metadata?: DocumentMetadata;
}

export interface Chunk {
  text: string;
  index: number;
  metadata?: DocumentMetadata;
}

export interface EmbeddedChunk extends Chunk {
  embedding: number[];
  tokenCount: number;
  metadata?: DocumentMetadata;
}
