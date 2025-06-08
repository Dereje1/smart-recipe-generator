import { MongoClient } from 'mongodb';

declare global {
  var _mongoClientPromise: ReturnType<typeof MongoClient.prototype.connect> | undefined;
}

export {};

declare module '*.gif' {
  const src: string;
  export default src;
}
