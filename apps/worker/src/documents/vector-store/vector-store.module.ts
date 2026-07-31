import { Module } from '@nestjs/common';
import { VectorStoreService } from './vector-store.service';

@Module({
  providers: [VectorStoreService],
})
export class VectorStoreModule {}
