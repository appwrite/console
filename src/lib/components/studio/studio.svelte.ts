import { SvelteMap, SvelteSet, SvelteURL } from 'svelte/reactivity';
import { Synapse, type SyncWorkDirData } from './synapse.svelte';
import * as monaco from 'monaco-editor';
import editorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker';
import jsonWorker from 'monaco-editor/esm/vs/language/json/json.worker?worker';
import cssWorker from 'monaco-editor/esm/vs/language/css/css.worker?worker';
import htmlWorker from 'monaco-editor/esm/vs/language/html/html.worker?worker';
import tsWorker from 'monaco-editor/esm/vs/language/typescript/ts.worker?worker';
import markdownWorker from 'monaco-editor/esm/vs/basic-languages/markdown/markdown?worker';
import { app } from '$lib/stores/app';
import { get } from 'svelte/store';

class Studio {
    #host: string;
    #artifact: string;
    readonly mainTerminalId = Symbol();
    terminals = new SvelteMap<symbol, Synapse>();
    activeTerminal = $state(this.mainTerminalId);
    filesystem: SvelteSet<string> = $state(new SvelteSet());
    currentFile: string | null = $state(null);
    openFiles: SvelteSet<string> = $state(new SvelteSet());
    synapse: Synapse;
    editor: monaco.editor.IStandaloneCodeEditor;
    streaming: boolean = $state(false);
    follow: boolean = $state(false);

    constructor(host: string) {
        this.#host = host;
        this.synapse = new Synapse(host);
        this.synapse.addEventListener('syncWorkDir', ({ message }) => {
            const { path, event } = message.data as SyncWorkDirData;
            if (event === 'add') this.filesystem.add(path);
            if (event === 'unlink') this.filesystem.delete(path);
        });
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
    initEditor(node: HTMLElement) {
        self.MonacoEnvironment = {
            getWorker(_workerId: string, label: string) {
                if (label === 'markdown') {
                    return new markdownWorker();
                }
                if (label === 'json') {
                    return new jsonWorker();
                }
                if (label === 'css' || label === 'scss' || label === 'less') {
                    return new cssWorker();
                }
                if (label === 'html') {
                    return new htmlWorker();
                }
                if (label === 'typescript' || label === 'javascript') {
                    return new tsWorker();
                }
                return new editorWorker();
            }
        };

        monaco.languages.typescript.typescriptDefaults.setEagerModelSync(true);
        this.editor = monaco.editor.create(node, {
            theme: get(app).themeInUse === 'light' ? 'vs-light' : 'vs-dark',
            scrollbar: {
                verticalScrollbarSize: 4,
                horizontalScrollbarSize: 4
            }
        });
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
        this.synapse.changeArtifact(this.#endpoint, this.#artifact, true);
        this.#resetTerminals();
        this.#resetFileSystem();
        await this.synapse.isConnected();
        await this.#initFileSystem();
    }
}

export const studio = new Studio('wss://terminal.appwrite.torsten.work');
