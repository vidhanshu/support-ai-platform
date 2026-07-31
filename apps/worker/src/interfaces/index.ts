export interface ExtractedDocument {
  text: string;
  metadata: {
    pageCount: number;
  };
}

export interface Chunk {
  text: string;
  index: number;
}

export interface EmbeddedChunk extends Chunk {
  embedding: number[];
}
