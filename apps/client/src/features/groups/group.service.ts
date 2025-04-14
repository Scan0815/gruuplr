import { GroupRepository } from './group.repository';
import { Group } from './group.model';
import { v4 as uuidv4 } from 'uuid';
import { KeyStoreEntry } from '../keystore/keystore.model';
import { db } from '../../db/AppDatabase';
import { KeystoreRepository } from '../keystore/keystore.repository';
import { AccountService } from '../account/account.service';
import { liveQuery } from 'dexie';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export class GroupService {
  private repository: GroupRepository;
  private keystoreRepository: KeystoreRepository;
  private groupsSubject = new BehaviorSubject<Group[]>([]);
  public groups$: Observable<Group[]> = this.groupsSubject.asObservable();

  constructor(
    repository?: GroupRepository,
    keystoreRepository?: KeystoreRepository
  ) {
    this.repository = repository || new GroupRepository(db);
    this.keystoreRepository = keystoreRepository || new KeystoreRepository(db);
    this.initializeLiveQuery();
  }

  private initializeLiveQuery(): void {
    const userId = AccountService.getInstance().getUserId();
    liveQuery(() => this.repository.getAll(userId))
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
   * Creates a new group and a corresponding keystore entry in a single transaction.
   *
   * @param groupData Group data excluding id, createdAt, and updatedAt.
   * @param encryptionKey The encryption key to store in the keystore.
   * @returns The newly created group's id.
   */
  async createGroupWithKey(
    groupData: Omit<Group, 'id' | 'createdAt' | 'updatedAt'>,
    encryptionKey: ArrayBuffer
  ): Promise<Group> {
    // Generate unique IDs for the group and keystore entry.
    const groupId = uuidv4();
    const now = Date.now();

    const newGroup: Group = {
      id: groupId,
      ...groupData,
      createdAt: now,
      updatedAt: now,
    };

    const newKeyEntry: KeyStoreEntry = {
      id: uuidv4(),
      groupId: groupId,
      encryptionKey: encryptionKey,
      createdAt: now,
    };

    // Perform both operations in a single transaction.
    await db.transaction('rw', db.groups, db.keystore, async () => {
      await this.repository.create(newGroup);
      await this.keystoreRepository.addKey(newKeyEntry);
    });

    return newGroup;
  }

  /**
   * Creates a new group.
   * Automatically generates an ID and timestamps.
   * @param groupData Group data excluding id, createdAt, and updatedAt.
   * @returns The newly created group's ID.
   */
  async createGroup(
    groupData: Omit<Group, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<string> {
    // Generate a unique id for the group. If you have a max length requirement, consider using nanoid.
    const id = uuidv4();
    const now = Date.now();
    const newGroup: Group = {
      id,
      ...groupData,
      createdAt: now,
      updatedAt: now,
    };
    await this.repository.create(newGroup);
    return id;
  }

  /**
   * Retrieves a group by its ID.
   * @param id The group's ID.
   * @returns The group object, or undefined if not found.
   */
  async getGroupById(id: string): Promise<Group | undefined> {
    return await this.repository.getById(id);
  }

  /**
   * Updates an existing group.
   * Automatically sets the updatedAt timestamp.
   * @param id The group's ID.
   * @param updateData
   * @returns The number of records updated.
   */
  async updateGroup(id: string, updateData: Partial<Group>): Promise<number> {
    const now = Date.now();
    // Update the updatedAt field to the current timestamp.
    return await this.repository.update(
      id,
      Object.assign(updateData, { updatedAt: now })
    );
  }

  /**
   * Deletes a group by its ID.
   * @param id The group's ID.
   */
  async deleteGroup(id: string): Promise<void> {
    const now = Date.now();
    const group = await this.repository.getById(id) as Group;
    await this.repository.update(
      id,
      Object.assign(group, { deletedAt: now })
    );
  }

  /**
   * Lists all groups.
   * @returns An array of group objects.
   */
  async listGroups(): Promise<Group[]> {
    // Get the current user's ID from the account service.
    const userId = AccountService.getInstance().getUserId();
    return await this.repository.getAll(userId);
  }
}
