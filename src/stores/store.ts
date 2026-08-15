import { defineStore, acceptHMRUpdate } from "pinia";
import axios from "axios";
import { load } from "js-yaml";
import configRaw from "../assets/config.yaml?raw";

interface PlatformUpdateInfo {
  tag_name: string;
  download_url: string;
  store_url: string;
  body: string;
}

export const useVpnStore = defineStore("vpn", {
  state: () => ({
    activeServer: "",
    servers: [] as string[],
    lastChecked: 0,
    isChecking: false,
    updateInfo: {} as Record<string, PlatformUpdateInfo>,
  }),

  getters: {
    hasActiveServer: (state) => !!state.activeServer,
    isValidServer: (state) => (server: string) =>
      state.servers.includes(server),
    getDownloadUrl: (state) => (platform: string) => {
      if (!state.activeServer || !state.updateInfo[platform]) {
        return "";
      }
      const downloadUrl = state.updateInfo[platform].download_url.trim();
      return `https://${state.activeServer}/${downloadUrl}`;
    },
  },

  actions: {
    async fetchServerList(): Promise<string[]> {
      try {
        const config = load(configRaw) as { nodes: Record<string, string[]> };
        this.servers = config?.nodes?.[0] || [];
        return this.servers;
      } catch {
        this.servers = [];
        return [];
      }
    },

    async getActiveServer(): Promise<string> {
      if (this.isChecking) {
        return this.activeServer;
      }

      this.isChecking = true;

      try {
        if (!this.servers.length) {
          await this.fetchServerList();
        }

        if (!this.servers.length) {
          throw new Error("No servers available");
        }

        const promises = this.servers.map((server: string) => {
          const url = import.meta.env.DEV
            ? `/api/health?server=${server}`
            : `https://${server}/vpn/health`;
          return axios
            .get(url, { timeout: 5000 })
            .then(() => server);
        });

        const activeServer = await Promise.any(promises);
        this.activeServer = activeServer;
        this.lastChecked = Date.now();
        return activeServer;
      } catch {
        this.activeServer = "";
        throw new Error("No valid server found");
      } finally {
        this.isChecking = false;
      }
    },

    clearActiveServer(): void {
      this.activeServer = "";
      this.lastChecked = 0;
    },

    async fetchUpdateInfo(): Promise<void> {
      try {
        const response = await fetch("/update.json");
        this.updateInfo = (await response.json()) as Record<
          string,
          PlatformUpdateInfo
        >;
      } catch {
        this.updateInfo = {};
      }
    },
  },
});

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useVpnStore, import.meta.hot));
}
