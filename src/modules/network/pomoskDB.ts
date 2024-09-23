import pgPromise from "pg-promise";

function makeDbInstance() {
  if (!(global as any).cachedPomoskDbInstance) {
    const pgp = pgPromise();
    (global as any).cachedPomoskDbInstance = pgp({
      connectionString: process.env.POMOSK_DATABASE_URL,
    });
  }
}
makeDbInstance();
export default (global as any).cachedPomoskDbInstance as pgPromise.IDatabase<any> & { any: any };
