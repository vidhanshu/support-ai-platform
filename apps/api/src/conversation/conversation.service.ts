import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@repo/database';
import type { WorkspaceContext } from '../common/interfaces/request.interface';

@Injectable()
export class ConversationService {
    constructor(private readonly prismaService: PrismaService) {}

    async findAll(workspace: WorkspaceContext, id: string) {
        const conversation = await this.prismaService.conversation.findFirst({
            where: { id, workspaceId: workspace.id },
            include: {
                messages: true,
            },
        });

        if (!conversation) throw new NotFoundException("Conversation not found");

        return conversation;
    }
}
