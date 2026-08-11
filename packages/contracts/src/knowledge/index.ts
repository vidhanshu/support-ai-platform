/** Document-level metadata stored on KnowledgeSource.metadata */
export interface KnowledgeSourceMetadata {
  title?: string;
  pageCount?: number;
  language?: string;
  author?: string;
  createdAt?: string;
  modifiedAt?: string;
  rootUrl?: string;
}

/** Chunk-level metadata for citations */
export interface ChunkMetadata {
  pageNumber?: number;
  url?: string;
  title?: string;
}

export interface ExtractedPage {
  text: string;
  pageNumber: number;
  url?: string;
  title?: string;
}

export interface ExtractedDocument {
  pages: ExtractedPage[];
  metadata: KnowledgeSourceMetadata;
}

export interface ExtractedWebPage {
  url: string;
  title?: string;
  text: string;
}

export interface ExtractedWebsite {
  pages: ExtractedWebPage[];
  metadata: KnowledgeSourceMetadata;
}

export interface ExtractedTextSnippet {
  title: string;
  text: string;
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
  url?: string;
  metadata?: ChunkMetadata | null;
}

export interface CrawlOptions {
  rootUrl: string;
  allowedHosts?: string[];
  maxPages?: number;
  maxDepth?: number;
}

export interface CrawlResult {
  pages: ExtractedWebPage[];
  pagesFound: number;
  pagesCrawled: number;
  rootUrl: string;
}
