import pgPromise from "pg-promise";

const pgp = pgPromise();

function getDbInstance() {
  if (!(global as any).cachedDbInstance) {
    (global as any).cachedDbInstance = pgp({
      connectionString: process.env.DATABASE_URL,
    });
  }
  return (global as any).cachedDbInstance;
}

export default getDbInstance();
