<script lang="ts">
    import { Button } from '$lib/elements/forms';
    import { Modal } from '$lib/components';
    import { Pill } from '$lib/elements';
    import { createEventDispatcher } from 'svelte';
    import { empty } from '$lib/helpers/array';
    import Copy from './copy.svelte';

    // Props
    export let show = false;

    // Types & Constants
    type Service = {
        name: string;
        resources: Resource[];
        actions?: Action[];
    };

    type Resource = {
        name: string;
        actions?: Action[];
    };

    type Action = {
        name: string;
        attributes?: string[];
    };

    type FieldType = 'service' | 'resource' | 'action' | 'attribute';

    const services: Array<Service> = [
        {
            name: 'buckets',
            resources: [
                {
                    name: 'files',
                    actions: [{ name: 'create' }, { name: 'update' }, { name: 'delete' }]
                }
            ],
            actions: [{ name: 'create' }, { name: 'update' }, { name: 'delete' }]
        },
        {
            name: 'databases',
            resources: [
                {
                    name: 'collections',
                    actions: [{ name: 'create' }, { name: 'update' }, { name: 'delete' }]
                },
                {
                    name: 'documents',
                    actions: [{ name: 'create' }, { name: 'update' }, { name: 'delete' }]
                }
            ],
            actions: [{ name: 'create' }, { name: 'update' }, { name: 'delete' }]
        },
        {
            name: 'functions',
            resources: [
                {
                    name: 'deployments',
                    actions: [{ name: 'create' }, { name: 'update' }, { name: 'delete' }]
                },
                {
                    name: 'executions',
                    actions: [{ name: 'create' }, { name: 'update' }, { name: 'delete' }]
                }
            ],
            actions: [{ name: 'create' }, { name: 'update' }, { name: 'delete' }]
        },
        {
            name: 'teams',
            resources: [
                {
                    name: 'memberships',
                    actions: [{ name: 'create' }, { name: 'update' }, { name: 'delete' }]
                }
            ],
            actions: [
                { name: 'create' },
                { name: 'update', attributes: ['status'] },
                { name: 'delete' }
            ]
        },
        {
            name: 'users',
            resources: [
                { name: 'recovery', actions: [{ name: 'create' }, { name: 'delete' }] },
                { name: 'sessions', actions: [{ name: 'create' }, { name: 'delete' }] },
                { name: 'verifications', actions: [{ name: 'create' }, { name: 'delete' }] }
            ],
            actions: [
                { name: 'create' },
                { name: 'update', attributes: ['email', 'name', 'password', 'status', 'prefs'] },
                { name: 'delete' }
            ]
        }
    ];

    // Helpers
    const dispatch = createEventDispatcher();

    function create() {
        show = false;
        dispatch('created', copyValue);
    }

    function select(field: 'service', value: Service);
    function select(field: 'resource', value: Resource);
    function select(field: 'action', value: Action);
    function select(field: 'attribute', value: string);
    function select(field: FieldType, value: string | Service | Resource | Action) {
        if (typeof value === 'string') {
            selected[field as 'attribute'] = selected[field] === value ? null : value;
        } else {
            selected[field as any] = (selected[field] as any)?.name === value.name ? null : value;
        }

        switch (field) {
            case 'service': {
                selected.resource = null;
                selected.action = null;
                selected.attribute = null;
                break;
            }
            case 'resource': {
                const availableActions = selected.resource
                    ? selected.resource?.actions
                    : selected.service?.actions;

                if (!availableActions.map((a) => a.name).includes(selected.action?.name)) {
                    selected.action = null;
                    selected.attribute = null;
                } else if (!selected?.action?.attributes.includes(selected.attribute)) {
                    selected.attribute = null;
                }
                break;
            }
            case 'action': {
                selected.attribute = null;
                break;
            }
        }
    }

    // State & Reactive Declarations
    let selected = {
        service: null as Service | null,
        resource: null as Resource | null,
        action: null as Action | null,
        attribute: null as string | null
    };
    let helper: string = null;
    let inputData: string = null;
    let showInput = false;
    let copyParent: HTMLElement;

    $: available = {
        services: services,
        resources: selected.service?.resources || [],
        actions: (selected.resource ? selected.resource?.actions : selected.service?.actions) || [],
        attributes: selected.action?.attributes || []
    };

    $: eventString = (function createEventString() {
        const data: Array<{ value: string; description: string }> = [];

        if (selected.service) {
            data.push({ value: selected.service?.name, description: 'service' });
            data.push({ value: '*', description: `ID of ${selected.service?.name.slice(0, -1)}` });
        }

        if (selected.resource) {
            if (selected.resource.name === 'documents') {
                data.push({ value: 'collections', description: 'resource' });
                data.push({ value: '*', description: `ID of collection` });
                data.push({ value: selected.resource.name, description: 'secondary resource' });
            } else {
                data.push({ value: selected.resource.name, description: 'resource' });
            }

            data.push({ value: '*', description: `ID of ${selected.resource.name.slice(0, -1)}` });
        }

        if (selected.action) {
            data.push({ value: selected.action.name, description: 'action' });
        }

        if (selected.attribute && !selected.resource) {
            data.push({ value: selected.attribute, description: 'attribute' });
        } else if (selected.action?.attributes && !selected.resource) {
            data.push({ value: '*', description: `attribute` });
        }
        return data;
    })();

    $: copyValue = inputData ?? eventString.map((d) => d.value).join('.');

    $: if (!showInput) {
        helper = null;
    }

    $: if (!show) {
        Object.keys(selected).forEach((key) => (selected[key] = null));
        helper = null;
        inputData = null;
        showInput = false;
    }
</script>

<Modal bind:show on:submit={create} size="big">
    <svelte:fragment slot="header">Create Event</svelte:fragment>

    <div>
        <p class="u-text">Choose a service</p>
        <div class="u-flex u-gap-8 u-margin-block-start-8">
            {#each available.services as service}
                <Pill
                    disabled={showInput}
                    selected={selected.service?.name === service.name}
                    button
                    on:click={() => select('service', service)}>
                    {service.name}
                </Pill>
            {/each}
        </div>
    </div>

    {#if !empty(available.resources)}
        <div>
            <p class="u-text">Choose a resource (optional)</p>
            <div class="u-flex u-gap-8 u-margin-block-start-8">
                {#each available.resources as resource}
                    <Pill
                        disabled={showInput}
                        selected={selected.resource?.name === resource.name}
                        button
                        on:click={() => select('resource', resource)}>
                        {resource.name}
                    </Pill>
                {/each}
            </div>
        </div>
    {/if}

    {#if !empty(available.actions)}
        <div>
            <p class="u-text">Choose an action (optional)</p>
            <div class="u-flex u-gap-8 u-margin-block-start-8">
                {#each available.actions as action}
                    <Pill
                        disabled={showInput}
                        selected={selected.action?.name === action.name}
                        button
                        on:click={() => select('action', action)}>
                        {action.name}
                    </Pill>
                {/each}
            </div>
        </div>
    {/if}

    {#if !empty(available.attributes)}
        <div>
            <p class="u-text">Choose an attribute (optional)</p>
            <div class="u-flex u-gap-8 u-margin-block-start-8">
                {#each available.attributes as attribute}
                    <Pill
                        disabled={showInput}
                        selected={selected.attribute === attribute}
                        button
                        on:click={() => select('attribute', attribute)}>
                        {attribute}
                    </Pill>
                {/each}
            </div>
        </div>
    {/if}

    {#if showInput}
        <div class="input-text-wrapper" style="--amount-of-buttons:2">
            <input type="text" placeholder="Enter custom event" bind:value={inputData} />
            <div class="options-list">
                <button
                    on:click|preventDefault={() => {
                        showInput = false;
                    }}
                    class="options-list-button"
                    aria-label="confirm">
                    <span class="icon-check" aria-hidden="true" />
                </button>
                <button
                    on:click|preventDefault={() => {
                        inputData = null;
                        showInput = false;
                    }}
                    class="options-list-button"
                    aria-label="cancel">
                    <span class="icon-x" aria-hidden="true" />
                </button>
            </div>
        </div>
    {:else}
        <div class="input-text-wrapper" style="--amount-of-buttons:2" bind:this={copyParent}>
            <div type="text" readonly style="min-height: 2.5rem;">
                {#if inputData}
                    <span>{inputData}</span>
                {:else}
                    {#each eventString as route, i}
                        <span
                            class:u-opacity-0-5={helper !== route.description}
                            on:mouseenter={() => (helper = route.description)}
                            on:mouseleave={() => (helper = null)}>
                            {route.value}
                        </span>
                        <span class="u-opacity-0-5">
                            {i + 1 < eventString?.length ? '.' : ''}
                        </span>
                    {/each}
                {/if}
            </div>
            <div class="options-list">
                <button
                    on:click|preventDefault={() => {
                        inputData = copyValue;
                        showInput = true;
                    }}
                    class="options-list-button"
                    aria-label="edit event">
                    <span class="icon-pencil" aria-hidden="true" />
                </button>
                <button disabled={!copyValue} class="options-list-button" aria-label="copy text">
                    {#key copyParent}
                        <Copy value={copyValue} appendTo={copyParent}>
                            <span class="icon-duplicate" aria-hidden="true" />
                        </Copy>
                    {/key}
                </button>
            </div>
            <p style="height: 2rem;">{helper ?? ''}</p>
        </div>
    {/if}

    <svelte:fragment slot="footer">
        <Button secondary on:click={() => (show = false)}>Cancel</Button>
        <Button disabled={showInput || !copyValue} submit>Create</Button>
    </svelte:fragment>
</Modal>
