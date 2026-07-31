import { Injectable } from "@nestjs/common";

@Injectable()
export class DocumentsService {
  async process(data: object) {
    console.log(data)
  }
}
