const globalStore = globalThis as any;

export const jobStore: Map<string, any> = globalStore.jobStore || new Map();

globalStore.jobStore = jobStore;
