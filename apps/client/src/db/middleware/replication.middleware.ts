import { Middleware } from 'dexie';
import { db } from '../AppDatabase';
//import { ReplicationService } from '../../features/replication/replication.service';
export class ReplicationMiddleware implements Middleware<any> {
  // Must be exactly the literal "dbcore"
  public stack: 'dbcore' = 'dbcore';
  public name = 'ReplicationMiddleware';

  // The create method receives the down-level DBCore object.
  create(downlevelDatabase: any) {
    // Return a new DBCore that overrides the table method.
    return {
      ...downlevelDatabase,
      table: (tableName: string) => {
        // Get the original table.
        const downlevelTable = downlevelDatabase?.table(tableName);

        if(!['groups', 'keystore'].includes(tableName)){
          return downlevelTable;
        }

        console.log(`ReplicationMiddleware: intercepting table ${tableName}`);

        // Return a proxy of the table that overrides the mutate method.
        return {
          ...downlevelTable,
          mutate: async (req: any) => {
            console.log(
              `ReplicationMiddleware mutate: ${req.type} on table ${tableName}`,
              req
            );

            // Skip replication if we're currently processing a replication record
            if ((window as any).__isReplicating) {
              console.log('Skipping replication middleware - currently processing replication record');
              return downlevelTable.mutate(req);
            }

            // Before the actual mutation occurs, inspect the operations.
            // The exact property name may differ (e.g., req.ops or req.operations)
            if (['add', 'put', 'delete'].includes(req.type)) {
              console.log(
                `ReplicationMiddleware: ${req.type} op on table ${tableName}`,
                req.values
              );
              try {
                // Execute the original mutation first
                const mutationResult = await downlevelTable.mutate(req);
                
                // Queue the replication record addition for after the current transaction
                setTimeout(async () => {
                  try {
                    // Use a separate transaction for the replication queue
                    await db.transaction('rw!', db.replicationQueue, async () => {
                      // Take the first element of the values array since we're dealing with single record operations
                      const recordData = Array.isArray(req.values) ? req.values[0] : req.values;
                      await db.replicationQueue.add({
                        tableName,
                        operation: req.type,
                        data: recordData,
                        timestamp: Date.now()
                      });
                      console.log("Replication record added successfully");
                    });
                  } catch (error) {
                    console.error('Failed to add replication record:', error);
                  }
                }, 0);

                return mutationResult;
              } catch (error) {
                console.error('Failed to add replication record:', error);
                throw error; // Re-throw to ensure the original mutation is rolled back
              }
            }

            // If not a replicated table, just execute the mutation
            return await downlevelTable.mutate(req);
          },
        };
      },
    };
  }
}
