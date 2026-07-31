import { Injectable } from "@nestjs/common";
import { ExtractedDocument } from "@repo/contracts";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";

@Injectable()
export class ExtractionService {
  async extractPdfText(tmpFile: string): Promise<ExtractedDocument> {
    const loader = new PDFLoader(tmpFile);
    const docs = await loader.load();

    if (docs.length === 0) {
      throw new Error(`No text found in PDF ${tmpFile}`);
    }
    const text = docs.map((doc) => doc.pageContent).join("\n");
    const title = docs[0]?.metadata?.pdf?.info?.Title;
    const pageNumber = docs[0]?.metadata?.loc?.pageNumber;
    const language = docs[0]?.metadata?.pdf?.info?.Language;

    return {
      text,
      metadata: {
        pageCount: docs.length,
        pageNumber,
        title,
        language,
        createdAt: docs[0]?.metadata?.pdf?.info?.CreationDate,
        modifiedAt: docs[0]?.metadata?.pdf?.info?.ModDate,
      },
    };
  }
}
