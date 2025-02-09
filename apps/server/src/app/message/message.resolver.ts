import { Resolver, Query, Args } from '@nestjs/graphql';
import { MessageService } from './message.service';
import { MessageDTO } from '@gruuplr/dtos';

@Resolver(() => MessageDTO)
export class MessageResolver {
  constructor(private readonly messageService: MessageService) {}

  @Query(() => [MessageDTO])
  async getMessages(
    @Args('groupId') groupId: string,
    @Args('since', { nullable: true }) since?: number,
  ): Promise<MessageDTO[]> {
    return this.messageService.getMessages(groupId, since);
  }
}
