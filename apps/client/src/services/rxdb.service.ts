import { createRxDatabase, RxCollection, RxDatabase } from 'rxdb';
import { getRxStorageDexie } from 'rxdb/plugins/storage-dexie';
import { v4 as uuidv4 } from "uuid";

interface Message {
  id: string;
  text: string;
  userId: string;
  updatedAt: number;
}

const MessagesSchema = {
  title: "messages",
  version: 0,
  description: "describes a simple hero",
  primaryKey: "id",
  type: "object",
  properties: {
    id: { type: 'string', primary: true, maxLength: 20 },
    text: { type: 'string'},
    userId: { type: 'string'},
    updatedAt: { type: 'number'}
  },
  required: ['text', 'userId']
};


export class RxDBService {
  private db: RxDatabase;
  private messagesCollection:RxCollection<Message>;

  // Initialisierung der RXDB-Datenbank mit Dexie-Adapter
  public async initialize() {
    try {
      // Erstelle eine RXDB-Datenbank mit Dexie als Speicher
      this.db = await createRxDatabase({
        name: 'chatdb',
        storage: getRxStorageDexie(), // Dexie als Adapter verwenden
      });

      // Erstelle eine Sammlung für Nachrichten
      const collections = await this.db.addCollections({
        messages: {
          schema: MessagesSchema
        },
      });
      // Die Collection messages holen
      this.messagesCollection = collections.messages;
      console.log('RXDB initialized with Dexie storage');
    } catch (error) {
      console.error('Error initializing RXDB:', error);
    }

  }

  public async clear() {
    try {
      await this.db.remove();
    } catch (error) {
      console.error('Error clearing RXDB:', error);
    }
  }


  // Methode zum Hinzufügen einer Nachricht
  public async addMessage(text: string, userId: string): Promise<void> {
    try {
      const newMessage: Message = {
        id: uuidv4(),
        text,
        userId,
        updatedAt: Date.now()
      };

      // Füge die neue Nachricht in die Sammlung ein
      await this.messagesCollection.insert(newMessage);
      console.log('Message added:', newMessage);
    } catch (error) {
      console.error('Error adding message:', error);
    }
  }

  // Methode zum Abrufen aller Nachrichten
  public async getMessages(_userId:string): Promise<Message[]> {
    try {
      const messages = await this.messagesCollection.find().exec(); // Alle Nachrichten abfragen
      return messages.map((msg: any) => ({
        id: msg.id,
        text: msg.text,
        userId: msg.userId,
        updatedAt: msg.updatedAt
      }));
    } catch (error) {
      console.error('Error retrieving messages:', error);
      return [];
    }
  }
}