import { debounce } from '$lib/helpers/debounce';
import { isMac } from '$lib/helpers/platform';
import { wizard } from '$lib/stores/wizard';
import { type ComponentType, onMount } from 'svelte';
import { derived, writable } from 'svelte/store';
import { nanoid } from 'nanoid/non-secure';
import { trackEvent } from '$lib/actions/analytics';
import { omit } from '$lib/helpers/omit';

const groups = [
    'ungrouped',
    'navigation',
    'projects',
    'organizations',
    'auth',
    'help',
    'account',
    'platforms',
    'databases',
    'functions',
    'messaging',
    'messages',
    'providers',
    'topics',
    'storage',
    'domains',
    'webhooks',
    'integrations',
    'migrations',
    'users',
    'collections',
    'attributes',
    'indexes',
    'documents',
    'teams',
    'security',
    'buckets',
    'files',
    'misc',
    'settings',
    'sites'
] as const;

export type CommandGroup = (typeof groups)[number];

type BaseCommand = {
    callback: () => void;
    label?: string;
    disabled?: boolean;
    forceEnable?: boolean;
    group?: CommandGroup;
    icon?: ComponentType;
    image?: string;
    rank?: number;
    nested?: boolean;
    keepOpen?: boolean;
};

type KeyedCommand = BaseCommand & {
    keys: string[];
    /* Ctrl on Windows/Linux, Meta on Mac */
    ctrl?: boolean;
    shift?: boolean;
    /* Alt on Windows/Linux, Option on Mac */
    alt?: boolean;
};

export function isKeyedCommand(command: Command): command is KeyedCommand {
    return 'keys' in command && Array.isArray((command as KeyedCommand).keys);
}

export type Command = KeyedCommand | BaseCommand;

export const commandMap = writable<Map<string, Command[]>>(new Map());
export const disabledMap = writable<Map<string, boolean>>(new Map());

// Derived stores
export const commands = derived(commandMap, ($commandMap) => {
    const res: Command[] = [];
    const keys = new Set<string>();

    const allCommands = Array.from($commandMap.values()).flat().toReversed();

    for (const command of allCommands) {
        if (isKeyedCommand(command) && !command.disabled) {
            const keysString = command.keys.join('+');
            if (keys.has(keysString)) {
                res.push(omit(command, 'keys'));
                continue;
            }
            keys.add(keysString);
        }
        res.push(command);
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

function getCommandRank(command: KeyedCommand) {
    const { keys, ctrl: meta, shift, alt } = command;
    const modifiers = [meta, shift, alt].filter(Boolean).length;
    return (keys?.length || 0) + modifiers * 10;
}

function hasDisputing(command: KeyedCommand, allCommands: Command[]) {
    return allCommands.some((otherCommand) => {
        if (command === otherCommand) {
            return false;
        }
        if (!isKeyedCommand(otherCommand)) {
            return false;
        }
        const keysString = command.keys.join('+');
        const otherKeysString = otherCommand?.keys?.join('+');

        const cmdRank = getCommandRank(command);
        const otherCmdRank = getCommandRank(otherCommand);

        return (
            (keysString.includes(otherKeysString) || otherKeysString.includes(keysString)) &&
            cmdRank <= otherCmdRank
        );
    });
}

export const commandCenterKeyDownHandler = derived(
    [commands, commandsEnabled, wizard],
    ([$commands, enabled, $wizard]) => {
        const commandsArr = $commands;
        let recentKeyCodes: number[] = [];
        let validCommands: KeyedCommand[] = [];

        const reset = debounce(() => {
            recentKeyCodes = [];
            validCommands = [];
        }, 1000);

        const getHighestPriorityCommand = () => {
            if (!validCommands.length) return;

            if (validCommands.length === 1) {
                return validCommands[0];
            }
            // Rank commands by how many keys and modifiers they have.
            // Each key is worth 1 point, each modifier is worth 10 points.
            // The command with the highest score wins.
            const rankedCommands = validCommands.map((command) => {
                return { command, score: getCommandRank(command) };
            });

            const highestScore = Math.max(...rankedCommands.map(({ score }) => score));
            const highestScoreCommands = rankedCommands.filter(
                ({ score }) => score === highestScore
            );

            if (highestScoreCommands.length === 1) {
                return highestScoreCommands[0].command;
            }

            // If there's still a tie, the command with the most modifiers wins.
            // And if even that's a tie, the first command wins.
            const mostModifiers = Math.max(
                ...highestScoreCommands.map(({ command }) => {
                    const { ctrl: meta, shift, alt } = command;
                    return [meta, shift, alt].filter(Boolean).length;
                })
            );
            const mostModifiersCommands = highestScoreCommands.filter(({ command }) => {
                const { ctrl: meta, shift, alt } = command;
                return [meta, shift, alt].filter(Boolean).length === mostModifiers;
            });

            return mostModifiersCommands[0]?.command;
        };

        const rankAndExecute = debounce(() => {
            const command = getHighestPriorityCommand();
            command?.callback();
            reset.immediate();
        }, 200);

        const execute = (command: KeyedCommand) => {
            if (hasDisputing(command, commandsArr)) {
                validCommands.push(command);
                rankAndExecute();
            } else {
                command.callback();
                reset.immediate();
            }
        };

        return (event: KeyboardEvent) => {
            recentKeyCodes.push(event.keyCode);
            reset();

            for (const command of commandsArr) {
                if (!isKeyedCommand(command)) continue;
                if (!command.forceEnable) {
                    if (command.disabled || !enabled || isInputEvent(event) || $wizard.show) {
                        continue;
                    }
                }

                const { keys, ctrl: meta, shift, alt } = command;

                const isMetaPressed = meta
                    ? isMac()
                        ? event.metaKey
                        : event.ctrlKey
                    : !(isMac() ? event.metaKey : event.ctrlKey);
                const isShiftPressed = shift ? event.shiftKey : !event.shiftKey;
                const isAltPressed = alt ? event.altKey : !event.altKey;

                const commandKeyCodes = keys?.map((key) => key.toUpperCase().charCodeAt(0));
                const allKeysPressed = commandKeyCodes
                    ? recentKeyCodes.join(',').includes(commandKeyCodes.join(','))
                    : false;

                if (allKeysPressed && isMetaPressed && isShiftPressed && isAltPressed) {
                    event.preventDefault();
                    execute(command);
                }
            }
        };
    }
);

// Methods
export const registerCommands = {
    subscribe(runner: (cb: (newCommands: Command[]) => void) => void) {
        const uuid = nanoid();

        runner((newCommands: Command[]) => {
            commandMap.update((curr) => {
                const commandsWithTracking = newCommands.map((command) => {
                    const trackingCallback = () => {
                        if (command.label) {
                            trackEvent('command', { label: command.label, group: command.group });
                        }
                        command.callback();
                    };

                    return { ...command, callback: trackingCallback };
                });

                curr.set(uuid, commandsWithTracking);
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
        const uuid = nanoid();

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

type CommandGroupRanks = Partial<Record<CommandGroup, number>>;

type GroupRanksMap = Map<string, CommandGroupRanks>;
const groupRanksMap = writable<GroupRanksMap>(new Map());

export const updateCommandGroupRanks = {
    subscribe(runner: (cb: (updater: CommandGroupRanks) => void) => void) {
        const uuid = nanoid();

        runner((groupRank: CommandGroupRanks) => {
            groupRanksMap.update((curr) => {
                curr.set(uuid, groupRank);
                return curr;
            });
        });

        return () => {
            groupRanksMap.update((curr) => {
                curr.delete(uuid);
                return curr;
            });
        };
    }
};

export const commandGroupRanks = derived(groupRanksMap, ($groupRankTransformations) => {
    const initialRanks = {
        ...Object.fromEntries(groups.map((group) => [group, 0])),
        ungrouped: 9999,
        databases: 50,
        users: 40,
        teams: 30,
        projects: 20,
        organizations: 10,
        navigation: 0,
        help: -20,
        misc: -30
    } as CommandGroupRanks;

    const transformations = Array.from($groupRankTransformations.values());
    return transformations.reduce((prev, curr) => ({ ...prev, ...curr }), initialRanks);
});

export type Searcher = (query: string) => Promise<Command[]>;
const searchersMap = writable<Map<string, Searcher[]>>(new Map());

export const registerSearchers = {
    subscribe(runner: (cb: (...searchers: Searcher[]) => void) => void) {
        const uuid = nanoid();

        runner((...searchers: Searcher[]) => {
            searchersMap.update((curr) => {
                curr.set(uuid, [...searchers]);
                return curr;
            });
        });

        return () => {
            searchersMap.update((curr) => {
                curr.delete(uuid);
                return curr;
            });
        };
    }
};

export const searchers = derived(searchersMap, ($searchersMap) => {
    return Array.from($searchersMap.values()).flat();
});

export const initSearcher = (searcher: Searcher) => {
    const search = writable('');
    const results = writable<Command[]>([]);

    const searcherDebounced = debounce(async (query: string) => {
        results.set(await searcher(query));
    }, 500);

    onMount(() => {
        searcherDebounced.immediate('');
        return search.subscribe((query) => {
            searcherDebounced(query);
        });
    });

    return {
        search,
        results
    };
};
