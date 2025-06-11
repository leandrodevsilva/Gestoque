export {};

declare global {
  interface Window {
    electron: {
      getUserDataPath: () => Promise<string>;
      saveBackup: (path: string, filename: string, content: string) => Promise<void>;
    }
  }
}
