import { Injectable } from "@nestjs/common";
import {
  ExtractedDocument,
  KnowledgeSourceMetadata,
} from "@repo/contracts";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";

@Injectable()
export class ExtractionService {
  async extractPdfText(tmpFile: string): Promise<ExtractedDocument> {
    const loader = new PDFLoader(tmpFile);
    const pdf = await loader.load();

    if (pdf.length === 0) {
      throw new Error(`No text found in PDF ${tmpFile}`);
    }

    const info = pdf[0]?.metadata?.pdf?.info as
      | Record<string, unknown>
      | undefined;

    const metadata: KnowledgeSourceMetadata = {
      title: typeof info?.Title === "string" ? info.Title : undefined,
      pageCount: pdf.length,
      language: typeof info?.Language === "string" ? info.Language : undefined,
      author: typeof info?.Author === "string" ? info.Author : undefined,
      createdAt:
        typeof info?.CreationDate === "string" ? info.CreationDate : undefined,
      modifiedAt:
        typeof info?.ModDate === "string" ? info.ModDate : undefined,
    };

    const pages = pdf.map((page, index) => {
      const pageNumber =
        typeof page.metadata?.loc?.pageNumber === "number"
          ? page.metadata.loc.pageNumber
          : index + 1;

      return {
        text: page.pageContent,
        pageNumber,
      };
    });

    return { pages, metadata };
  }
}
