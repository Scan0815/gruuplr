import { Middleware } from 'dexie';

export class LoggingMiddleware implements Middleware<any> {
  // Ensure the stack property is exactly the literal 'dbcore'
  public stack: 'dbcore' = 'dbcore';

  /**
   * The middleware create function intercepts the low-level DBCore object.
   * @param down The original DBCore instance.
   * @returns A modified version (or partial override) of DBCore.
   */
  public name =  "ReplicationMiddleware"; // Optional name of your middleware
  create (downlevelDatabase: { table: (arg0: any) => any; }) {
    // Return your own implementation of DBCore:
    return {
      // Copy default implementation.
      ...downlevelDatabase,
      // Override table method
      table (tableName: any) {
        // Call default table method
        const downlevelTable = downlevelDatabase.table(tableName);

        console.log("ReplicationMiddleware",downlevelTable);
        // Derive your own table from it:
        return {
          // Copy default table implementation:
          ...downlevelTable,
          // Override the mutate method:
          mutate: async (req: any) => {
            // Copy the request object
            const myRequest = {...req};
            // Do things before mutate, then
            // call downlevel mutate:
            const res = await downlevelTable.mutate(myRequest)
              // Do things after mutate
              // Then return your response:
            return { ...res };
          }
        }
      }
    }
  }
}