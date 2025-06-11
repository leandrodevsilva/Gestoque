import { useState, useEffect } from 'react';

export function useElectron() {
  const [userDataPath, setUserDataPath] = useState<string | null>(null);

  useEffect(() => {
    async function loadUserDataPath() {
      if (window.electron) {
        try {
          const path = await window.electron.getUserDataPath();
          setUserDataPath(path);
        } catch (error) {
          console.error('Erro ao obter caminho de dados:', error);
          setUserDataPath(null);
        }
      }
    }

    loadUserDataPath();
  }, []);

  return {
    userDataPath,
    isElectron: Boolean(window.electron),
    saveBackup: window.electron?.saveBackup
  };
}
