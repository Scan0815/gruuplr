import { createClient } from 'graphql-ws';
import { Observable } from 'rxjs';
import { gql, request } from 'graphql-request';


interface GetMessagesResponse {
  getMessages: Array<{
    id: string;
    text: string;
    userId: string;
    updatedAt: number;
  }>;
}

export class ReplicationService {
  private readonly replicationId: string;
  private readonly SyncFunction: (messages: any) => void;
  constructor(replicationId: string,syncFunction:(messages:any) => void = () => {}) {
    this.replicationId = replicationId;
    this.SyncFunction = syncFunction;
    this.subscription(this.replicationId);
  }

  private lastCheckpoint = Date.now();

  async pullMessages() {
  const document = gql`
    query ($userId: String!, $updatedAt: Float!) {
      getMessages(userId: $userId, updatedAt: $updatedAt) {
        id
        userId
        text
        updatedAt
      }
    }
    `;

    const response = await request<GetMessagesResponse>('http://localhost:3000/graphql', document, {
      updatedAt: this.lastCheckpoint,
      userId: this.replicationId,
    });

    this.lastCheckpoint = Date.now();


    return response.getMessages;

  }

  async pushMessage(text: string, userId: string) {
    const document = gql`
      mutation ($text: String!, $userId: String!) {
        createMessage(text: $text, userId: $userId) {
          id
          text
          userId
        }
      }
    `;

    const response = await request('http://localhost:3000/graphql', document, {
      text,
      userId,
    });
    console.log(response);
  }

  subscription(replicationId: string) {
    const client = createClient({
      url: 'ws://localhost:3000/graphql',
    });

    function toObservable(operation: { query: string }) {
      return new Observable((observer) =>
        client.subscribe(operation, {
          next: (data) => observer.next(data),
          error: (err) => observer.error(err),
          complete: () => observer.complete(),
        })
      );
    }

    const observable = toObservable({
      query: `subscription {readMessages(userId:"${replicationId}"){ text userId }}`,
    });

    return observable.subscribe({
      next: async () => {
        this.SyncFunction(await this.pullMessages());
      },
    });
  }
}
