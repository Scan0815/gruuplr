export interface KeyStoreEntry {
  /**
   * Unique identifier for the keystore entry.
   */
  id: string;
  /**
   * Identifier of the group this key is associated with.
   */
  groupId: string;
  /**
   * The actual encryption key.
   */
  encryptionKey: ArrayBuffer;
  /**
   * When this key was created.
   */
  createdAt: any;
  /**
   * Optional timestamp indicating until when this key was valid.
   * When a key is rotated, the old key can have a validUntil timestamp.
   */
  validUntil?: any;
}