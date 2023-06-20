import { debounce } from '$lib/helpers/debounce';
import { isMac } from '$lib/helpers/platform';
import { derived, writable } from 'svelte/store';

// Store
export type CommandGroup =
    | 'ungrouped'
    | 'navigation'
    | 'project'
    | 'auth'
    | 'help'
    | 'account'
    | 'platforms'
    | 'databases'
    | 'functions'
    | 'storage';

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
    group?: CommandGroup;
};

export const commandMap = writable<Map<string, Command[]>>(new Map());
export const disabledMap = writable<Map<string, boolean>>(new Map());

// Derived stores
export const commands = derived(commandMap, ($commandMap) => {
    return Array.from($commandMap.values()).flat();
});

export const groupedCommands = derived(commands, ($commands) => {
    const res = new Map<string, Command[]>();

    for (const command of $commands) {
        if (!command.group) {
            res.set('ungrouped', [...(res.get('ungrouped') || []), command]);
        } else {
            res.set(command.group, [...(res.get(command.group) || []), command]);
        }
    }

    return res;
});

const commandsEnabled = derived(disabledMap, ($disabledMap) => {
    // If there's an item on the disabledMap that's true, then disable the command center
    return Array.from($disabledMap.values()).every((disabled) => !disabled);
});

function isInputEvent(event: KeyboardEvent) {
    return ['INPUT', 'TEXTAREA', 'SELECT'].includes((event.target as HTMLElement).tagName);
}

export const commandCenterKeyDownHandler = derived(
    [commandMap, commandsEnabled],
    ([$commandMap, enabled]) => {
        const commandsArr = Array.from($commandMap.values()).flat();
        let recentKeyCodes: number[] = [];

        return (event: KeyboardEvent) => {
            recentKeyCodes.push(event.keyCode);
            debounce(() => (recentKeyCodes = []), 1000)();

            for (const command of commandsArr) {
                if (!command.forceEnable) {
                    if (command.disabled) continue;
                    if (!enabled) continue;
                    if (isInputEvent(event)) continue;
                }

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

// Methods
export const registerCommands = {
    subscribe(runner: (cb: (newCommands: Command[]) => void) => void) {
        const uuid = crypto.randomUUID();

        runner((newCommands: Command[]) => {
            commandMap.update((curr) => {
                curr.set(uuid, newCommands);
                return curr;
            });
        });

        return () => {
            commandMap.update((curr) => {
                curr.delete(uuid);
                return curr;
            });
        };
    }
};

export const disableCommands = {
    subscribe(runner: (cb: (disabled: boolean) => void) => void) {
        const uuid = crypto.randomUUID();

        runner((disabled: boolean) => {
            disabledMap.update((curr) => {
                curr.set(uuid, disabled);
                return curr;
            });
        });

        return () => {
            disabledMap.update((curr) => {
                curr.delete(uuid);
                return curr;
            });
        };
    }
};
