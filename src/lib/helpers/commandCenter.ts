import { derived, writable } from 'svelte/store';
import { debounce } from './debounce';
import { isMac } from './platform';

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
    disabledMap: Map<string, boolean>;
};

export const commandCenter = writable<CommandCenterState>({
    commandMap: new Map(),
    disabledMap: new Map()
});

export const commands = derived(commandCenter, ($commandCenter) => {
    return Array.from($commandCenter.commandMap.values()).flat();
});

const commandsEnabled = derived(commandCenter, ($commandCenter) => {
    // If there's an item on the disabledMap that's true, then disable the command center
    return Array.from($commandCenter.disabledMap.values()).every((disabled) => !disabled);
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

export const disableCommands = {
    subscribe(runner: (cb: (disabled: boolean) => void) => void) {
        const uuid = crypto.randomUUID();

        runner((disabled: boolean) => {
            commandCenter.update((curr) => {
                curr.disabledMap.set(uuid, disabled);
                return curr;
            });
        });

        return () => {
            commandCenter.update((curr) => {
                curr.disabledMap.delete(uuid);
                return curr;
            });
        };
    }
};

export const commandCenterKeyDownHandler = derived(
    [commandCenter, commandsEnabled],
    ([{ commandMap }, enabled]) => {
        const commandsArr = Array.from(commandMap.values()).flat();
        let recentKeyCodes: number[] = [];

        return (event: KeyboardEvent) => {
            // ignore keypresses that come from input, textarea and select elements
            if (['INPUT', 'TEXTAREA', 'SELECT'].includes((event.target as HTMLElement).tagName)) {
                return;
            }

            recentKeyCodes.push(event.keyCode);
            debounce(() => (recentKeyCodes = []), 1000)();

            for (const command of commandsArr) {
                if (command.disabled || (!enabled && !command.forceEnable)) continue;

                const { keys, ctrl: meta, shift, alt, callback } = command;

                const isMetaPressed = meta ? (isMac() ? event.metaKey : event.ctrlKey) : true;
                const isShiftPressed = shift ? event.shiftKey : true;
                const isAltPressed = alt ? event.altKey : true;

                const commandKeyCodes = keys.map((key) => key.toUpperCase().charCodeAt(0));
                const allKeysPressed = recentKeyCodes.join('').includes(commandKeyCodes.join(''));

                if (allKeysPressed && isMetaPressed && isShiftPressed && isAltPressed) {
                    event.preventDefault();
                    callback();
                    return;
                }
            }
        };
    }
);
