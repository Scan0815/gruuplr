import { createRxDatabase, RxCollection, RxDatabase } from 'rxdb';
import { getRxStorageDexie } from 'rxdb/plugins/storage-dexie';
import { v4 as uuidv4 } from "uuid";

export interface Message {
  id: string;
  text: string;
  userId: string;
  groupId: string;
  updatedAt: number;
}

const MessagesSchema = {
  title: "messages",
  version: 0,
  description: "describes a simple chat message",
  primaryKey: "id",
  type: "object",
  properties: {
    id: { type: 'string', primary: true, maxLength: 20 },
    text: { type: 'string' },
    userId: { type: 'string' },
    groupId: { type: 'string' },
    updatedAt: { type: 'number' }
  },
  required: ['text', 'userId', 'groupId']
};

export class RxDBService {
  // Use a static property to store the singleton instance of the database.
  private static instance: RxDatabase | null = null;

  private db!: RxDatabase;
  private messagesCollection!: RxCollection<Message>;

  /**
   * Initializes the RXDB database if it hasn't been initialized yet.
   * If already initialized, it returns the existing instance.
   */
  public async initialize(): Promise<RxDatabase|undefined> {
    // If already initialized, return the existing instance.
    if (RxDBService.instance) {
      this.db = RxDBService.instance;
      this.messagesCollection = this.db.collections.messages;
      return Promise.resolve(this.db);
    }

    try {
      this.db = await createRxDatabase({
        name: 'chatdb',
        storage: getRxStorageDexie(),
      });

      const collections = await this.db.addCollections({
        messages: {
          schema: MessagesSchema,
        },
      });
      this.messagesCollection = collections.messages;
      RxDBService.instance = this.db;
      console.log('RXDB initialized with Dexie storage');
      return Promise.resolve(this.db);
    } catch (error) {
      console.error('Error initializing RXDB:', error);
      return Promise.reject(error);
    }
  }

  public async clear() {
    try {
      if (this.db) {
        await this.db.remove();
        // Reset the singleton instance so it can be re-created if needed
        RxDBService.instance = null;
      }
    } catch (error) {
      console.error('Error clearing RXDB:', error);
    }
  }

  // Add a new message to the specified group
  public async addMessage(text: string, userId: string, groupId: string): Promise<void> {
    try {
      const newMessage: Message = {
        id: uuidv4(),
        text,
        userId,
        groupId,
        updatedAt: Date.now(),
      };

      await this.messagesCollection.insert(newMessage);
      console.log('Message added:', newMessage);
    } catch (error) {
      console.error('Error adding message:', error);
    }
  }

  // Retrieve all messages for a given group
  public async getMessages(groupId: string): Promise<Message[]> {
    try {
      const messages = await this.messagesCollection.find({
        selector: { groupId }
      }).exec();
      return messages.map((msg: any) => ({
        id: msg.id,
        text: msg.text,
        userId: msg.userId,
        groupId: msg.groupId,
        updatedAt: msg.updatedAt,
      }));
    } catch (error) {
      console.error('Error retrieving messages:', error);
      return [];
    }
  }
}