import { SvelteMap, SvelteSet, SvelteURL } from 'svelte/reactivity';
import { Synapse } from './synapse.svelte';

class Studio {
    #host: string;
    #artifact: string;
    readonly mainTerminalId = Symbol();
    terminals = new SvelteMap<symbol, Synapse>();
    activeTerminal = $state(this.mainTerminalId);
    filesystem: SvelteSet<string> = $state(new SvelteSet());
    synapse: Synapse;

    constructor(host: string) {
        this.#host = host;
        this.synapse = new Synapse(host);
    }

    createTerminal() {
        const symbol = Symbol();
        const synapse = new Synapse(this.#endpoint);
        synapse.connect();
        this.terminals.set(symbol, synapse);
        this.activeTerminal = symbol;
    }

    #resetTerminals() {
        this.activeTerminal = this.mainTerminalId;
        this.terminals.clear();
    }
    #resetFileSystem() {
        this.filesystem.clear();
    }

    async #initFileSystem() {
        const response = await this.synapse.dispatch('fs', {
            operation: 'getFolder',
            params: {
                folderpath: `.`
            }
        });
        const data = response.data as Array<{ name: string; isDirectory: boolean }>;
        if (!Array.isArray(data)) return;

        for (const { name, isDirectory } of data) {
            const key = isDirectory ? name + '/' : name;
            this.filesystem.add(key);
        }
    }
    get #endpoint(): string {
        const url = new SvelteURL(this.#host);
        url.searchParams.set('workDir', `/artifact/${this.#artifact}`);

        return url.toString();
    }
    async loadFolder(path: string) {
        const message = await studio.synapse.dispatch('fs', {
            operation: 'getFolder',
            params: {
                folderpath: path
            }
        });
        const data = message.data as Array<{ name: string; isDirectory: boolean }>;
        if (!Array.isArray(data)) return;

        for (const { name, isDirectory } of data) {
            const key = isDirectory ? name + '/' : name;
            this.filesystem.add(path + '/' + key);
        }
    }
    async selectArtifact(artifact: string) {
        this.#artifact = artifact;
        this.synapse.changeArtifact(this.#endpoint, this.#artifact);
        this.#resetTerminals();
        this.#resetFileSystem();
        await this.synapse.isConnected();
        await this.#initFileSystem();
    }
}

export const studio = new Studio('wss://terminal.appwrite.torsten.work');
