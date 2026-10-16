import { contextBridge, ipcRenderer } from 'electron';

export interface AuditOptions {
  jarPath: string;
}

export interface ProtectOptions {
  jarPath: string;
  stripLvt: boolean;
  encryptStrings: boolean;
  antiDecompile: boolean;
  outputPath?: string;
}

contextBridge.exposeInMainWorld('nanoGuardAPI', {
  auditJar: (jarPath: string, engine?: 'cpp' | 'rust') => ipcRenderer.invoke('audit-jar', jarPath, engine),
  protectJar: (options: ProtectOptions) => ipcRenderer.invoke('protect-jar', options),
  selectJarFile: () => ipcRenderer.invoke('select-jar-file'),
  selectOutputDir: () => ipcRenderer.invoke('select-output-dir'),
  openPath: (path: string) => ipcRenderer.invoke('open-path', path),
  getSystemStats: () => ipcRenderer.invoke('get-system-stats'),
  windowControl: (action: 'minimize' | 'maximize' | 'close') => ipcRenderer.send('window-control', action),
});
