declare module 'ts-limiter' {
  class Limiter {
    constructor(bucket: string, projectId: string);
    feature(featureId: string, userId: string): Promise<boolean>;
    increment(featureId: string, userId: string): Promise<void>;
    set(featureId: string, userId: string, value: number): Promise<void>;
  }
}
