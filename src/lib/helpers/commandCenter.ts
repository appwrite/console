import { onDestroy } from 'svelte';
import { derived, writable } from 'svelte/store';

type Command = {
    keys: string[];
    /* Ctrl on Windows/Linux, Meta on Mac */
    meta?: boolean;
    shift?: boolean;
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

export const commandCenter = (function init() {
    const store = writable<CommandCenterState>({
        commandMap: new Map(),
        enabled: true
    });

    return {
        ...store
    };
})();

export const commands = derived(commandCenter, ($commandCenter) => {
    return Array.from($commandCenter.commandMap.values()).flat();
});

export function CommandRegistrant() {
    const uuid = crypto.randomUUID();

    onDestroy(() => {
        commandCenter.update((curr) => {
            curr.commandMap.delete(uuid);
            return curr;
        });
    });

    return {
        register(newCommands: Command[]) {
            commandCenter.update((curr) => {
                curr.commandMap.set(uuid, newCommands);
                return curr;
            });
        }
    };
}

export function ExtendCommandRegistrant(baseCommands: Command[]) {
    return () => {
        const registrant = CommandRegistrant();

        return {
            register: (newCommands?: Command[]) => {
                registrant.register([...baseCommands, ...(newCommands ?? [])]);
            }
        };
    };
}

export const commandCenterKeyDownHandler = derived(commandCenter, ({ commandMap, enabled }) => {
    const commandsArr = Array.from(commandMap.values()).flat();

    return (event: KeyboardEvent) => {
        const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;

        for (const command of commandsArr) {
            if (command.disabled || (!enabled && !command.forceEnable)) continue;

            const { keys, meta, shift, alt, callback } = command;

            const keyCode = event.keyCode;
            const isMetaPressed = meta ? (isMac ? event.metaKey : event.ctrlKey) : true;
            const isShiftPressed = shift ? event.shiftKey : true;
            const isAltPressed = alt ? event.altKey : true;

            const commandKeyCodes = keys.map((key) => key.toUpperCase().charCodeAt(0));

            if (
                commandKeyCodes.includes(keyCode) &&
                isMetaPressed &&
                isShiftPressed &&
                isAltPressed
            ) {
                event.preventDefault();
                callback();
                return;
            }
        }
    };
});
