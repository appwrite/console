import { onDestroy } from 'svelte';
import { derived, writable } from 'svelte/store';

// type Key = 'a' | 'b' | 'c' | 'd' | 'e' | 'f' | 'g' | 'h' | 'i' | 'j' | 'k'
// | 'l' | 'm' | 'n' | 'o' | 'p' | 'q' | 'r' | 's' | 't' | 'u' | 'v' | 'w' | 'x'
// | 'y' | 'z' | 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G' | 'H' | 'I' | 'J' | 'K'
// | 'L' | 'M' | 'N' | 'O' | 'P' | 'Q' | 'R' | 'S' | 'T' | 'U' | 'V' | 'W' | 'X'
// | 'Y' | 'Z' | '0' | '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9'

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

const debounce = (fn: () => void, ms: number) => {
    let timeout: NodeJS.Timeout;
    return () => {
        clearTimeout(timeout);
        timeout = setTimeout(fn, ms);
    };
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

            const { keys, meta, shift, alt, callback } = command;

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
