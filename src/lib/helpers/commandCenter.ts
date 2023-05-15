import { derived, writable } from 'svelte/store';
import { debounce } from './debounce';

export type Command = {
    keys: string[];
    /* Ctrl on Windows/Linux, Meta on Mac */
    ctrl?: boolean;
    shift?: boolean;
    /* Alt on Windows/Linux, Option on Mac */
    alt?: boolean;
    callback: () => void;
    label?: string;
    disabled?: boolean;
    forceEnable?: boolean;
};

type CommandCenterState = {
    commandMap: Map<string, Command[]>;
    enabled: boolean;
};

export const commandCenter = writable<CommandCenterState>({
    commandMap: new Map(),
    enabled: true
});

export const commands = derived(commandCenter, ($commandCenter) => {
    return Array.from($commandCenter.commandMap.values()).flat();
});

export const registerCommand = {
    subscribe(runner: (cb: (newCommands: Command[]) => void) => void) {
        const uuid = crypto.randomUUID();

        runner((newCommands: Command[]) => {
            commandCenter.update((curr) => {
                curr.commandMap.set(uuid, newCommands);
                return curr;
            });
        });

        return () => {
            commandCenter.update((curr) => {
                curr.commandMap.delete(uuid);
                return curr;
            });
        };
    }
};

export const commandCenterKeyDownHandler = derived(commandCenter, ({ commandMap, enabled }) => {
    const commandsArr = Array.from(commandMap.values()).flat();
    const recentKeyCodes = new Set<number>();

    return (event: KeyboardEvent) => {
        const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;

        recentKeyCodes.add(event.keyCode);
        debounce(() => recentKeyCodes.clear(), 1000)();

        for (const command of commandsArr) {
            if (command.disabled || (!enabled && !command.forceEnable)) continue;

            const { keys, ctrl: meta, shift, alt, callback } = command;

            const isMetaPressed = meta ? (isMac ? event.metaKey : event.ctrlKey) : true;
            const isShiftPressed = shift ? event.shiftKey : true;
            const isAltPressed = alt ? event.altKey : true;

            const commandKeyCodes = keys.map((key) => key.toUpperCase().charCodeAt(0));
            const allKeysPressed = commandKeyCodes.every((keyCode) => recentKeyCodes.has(keyCode));

            if (allKeysPressed && isMetaPressed && isShiftPressed && isAltPressed) {
                event.preventDefault();
                callback();
                return;
            }
        }
    };
});
