import { GroupRepository } from './group.repository';
import { Group } from './group.model';
import { v4 as uuidv4 } from 'uuid';
import { KeyStoreEntry } from '../keystore/keystore.model';
import { db } from '../../db/AppDatabase';
import { KeystoreRepository } from '../keystore/keystore.repository';
import { liveQuery } from 'dexie';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { GroupGraphQL } from './group.graphql';

export class GroupService {
  private repository: GroupRepository;
  private keystoreRepository: KeystoreRepository;
  private groupsSubject = new BehaviorSubject<Group[]>([]);
  public groups$: Observable<Group[]> = this.groupsSubject.asObservable();
  private static instance: GroupService;

  private constructor(
    repository?: GroupRepository,
    keystoreRepository?: KeystoreRepository
  ) {
    this.repository = repository || new GroupRepository(db);
    this.keystoreRepository = keystoreRepository || new KeystoreRepository(db);
    this.initializeLiveQuery();
  }

  public static getInstance(
    repository?: GroupRepository,
    keystoreRepository?: KeystoreRepository
  ): GroupService {
    if (!GroupService.instance) {
      GroupService.instance = new GroupService(repository, keystoreRepository);
    }
    return GroupService.instance;
  }

  private initializeLiveQuery(): void {
    liveQuery(() => this.repository.getAll())
      .subscribe({
        next: (groups) => {
          this.groupsSubject.next(groups);
        },
        error: (error) => {
          console.error('Error in groups live query:', error);
        }
      });
  }

  /**
   * Get a specific group by ID as an observable
   */
  public getGroup$(id: string): Observable<Group | undefined> {
    return this.groups$.pipe(
      map(groups => groups.find(group => group.id === id))
    );
  }

  /**
   * Get all groups as an observable
   */
  public getAllGroups$(): Observable<Group[]> {
    return this.groups$;
  }

  /**
   * Creates a new group both online and offline with encryption key
   */
  async createGroupWithKey(
    name: string,
    description: string,
    encryptionKey: ArrayBuffer
  ): Promise<Group> {
    try {
      // 1. Create group online first
      const onlineGroup = await GroupGraphQL.createGroup(name, description);
      if (!onlineGroup?.id || !onlineGroup?.name || !onlineGroup?.description) {
        throw new Error('Invalid group data received from server');
      }
      
      // 2. Create local group with the same ID
      const now = Date.now();
      const newGroup: Group = {
        id: onlineGroup.id,
        name: onlineGroup.name,
        description: onlineGroup.description,
        createdAt: now,
        updatedAt: now,
      };

      // 3. Create keystore entry
      const newKeyEntry: KeyStoreEntry = {
        id: uuidv4(),
        groupId: onlineGroup.id,
        encryptionKey: encryptionKey,
        createdAt: now,
      };

      // 4. Store both group and key in local DB
      await db.transaction('rw', db.groups, db.keystore, async () => {
        await this.repository.create(newGroup);
        await this.keystoreRepository.addKey(newKeyEntry);
      });

      return newGroup;
    } catch (error) {
      console.error('Failed to create group:', error);
      throw error;
    }
  }

  /**
   * Creates a new group both online and offline
   */
  async createGroup(name: string, description: string): Promise<Group> {
    try {
      // 1. Create group online first
      const onlineGroup = await GroupGraphQL.createGroup(name, description);
      if (!onlineGroup?.id || !onlineGroup?.name || !onlineGroup?.description) {
        throw new Error('Invalid group data received from server');
      }
      
      // 2. Create local group with the same ID
      const now = Date.now();
      const newGroup: Group = {
        id: onlineGroup.id,
        name: onlineGroup.name,
        description: onlineGroup.description,
        createdAt: now,
        updatedAt: now,
      };

      // 3. Store in local DB
      await this.repository.create(newGroup);

      return newGroup;
    } catch (error) {
      console.error('Failed to create group:', error);
      throw error;
    }
  }

  /**
   * Syncs groups from server to local DB
   */
  async syncGroups(): Promise<void> {
    try {
      const onlineGroups = await GroupGraphQL.getGroups();
      
      await db.transaction('rw', db.groups, async () => {
        for (const onlineGroup of onlineGroups) {
          const localGroup = await this.repository.getById(onlineGroup.id as string);
          
          // If group exists locally, update it
          if (localGroup) {
            await this.repository.update(onlineGroup.id as string, {
              name: onlineGroup.name as string,
              description: onlineGroup.description as string,
              updatedAt: new Date(onlineGroup.updatedAt as string).getTime()
            });
          } else {
            // If group doesn't exist locally, create it
            await this.repository.create({
              id: onlineGroup.id as string,
              name: onlineGroup.name as string,
              description: onlineGroup.description as string,
              createdAt: new Date(onlineGroup.createdAt as string).getTime(),
              updatedAt: new Date(onlineGroup.updatedAt as string).getTime()
            });
          }
        }
      });
    } catch (error) {
      console.error('Failed to sync groups:', error);
      throw error;
    }
  }

  /**
   * Gets a group by ID, trying local first then online
   */
  async getGroupById(id: string): Promise<Group | undefined> {
    try {
      // Try local first
      const localGroup = await this.repository.getById(id);
      if (localGroup) return localGroup;

      // If not found locally, try online
      const onlineGroup = await GroupGraphQL.getGroupById(id);
      if (onlineGroup?.id && onlineGroup?.name && onlineGroup?.description) {
        const group: Group = {
          id: onlineGroup.id,
          name: onlineGroup.name,
          description: onlineGroup.description,
          createdAt: new Date(onlineGroup.createdAt || Date.now()).getTime(),
          updatedAt: new Date(onlineGroup.updatedAt || Date.now()).getTime(),
        };
        await this.repository.create(group);
        return group;
      }

      return undefined;
    } catch (error) {
      console.error('Failed to get group:', error);
      throw error;
    }
  }

  /**
   * Updates a group both online and offline
   */
  async updateGroup(id: string, updateData: Partial<Group>): Promise<number> {
    try {
      // Update online first
      await GroupGraphQL.updateGroup(
        id,
        updateData.name,
        updateData.description
      );

      // Then update locally
      const now = Date.now();
      return await this.repository.update(
        id,
        { ...updateData, updatedAt: now }
      );
    } catch (error) {
      console.error('Failed to update group:', error);
      throw error;
    }
  }

  /**
   * Soft deletes a group both online and offline
   */
  async deleteGroup(id: string): Promise<void> {
    try {
      // Delete online first
      const success = await GroupGraphQL.deleteGroup(id);
      if (!success) {
        throw new Error('Failed to delete group on server');
      }

      // Then mark as deleted locally
      const now = Date.now();
      const group = await this.repository.getById(id) as Group;
      await this.repository.update(
        id,
        { ...group, deletedAt: now }
      );
    } catch (error) {
      console.error('Failed to delete group:', error);
      throw error;
    }
  }

  /**
   * Lists all groups, combining local and online data
   */
  async listGroups(): Promise<Group[]> {
    try {
      // Get local groups first for immediate response
      const localGroups = await this.repository.getAll();

      // Then sync with server in background
      this.syncGroups().catch(console.error);

      return localGroups;
    } catch (error) {
      console.error('Failed to list groups:', error);
      throw error;
    }
  }
}
