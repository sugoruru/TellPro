import pgPromise from "pg-promise";

function makeDbInstance() {
  if (!(global as any).cachedDbInstance) {
    const pgp = pgPromise();
    (global as any).cachedDbInstance = pgp({
      connectionString: process.env.DATABASE_URL,
    });
  }
}
makeDbInstance();
export default (global as any).cachedDbInstance;
