import { MongoClient } from 'mongodb';

declare global {
  var _mongoClientPromise: Promise<MongoClient>;
}

export {};

declare module '*.gif' {
  const src: string;
  export default src;
}
