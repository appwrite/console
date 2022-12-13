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

    function select(field: FieldType, value: string) {
        selected[field] = selected[field] === value ? null : value;

        switch (field) {
            case 'service': {
                selected.resource = null;
                selected.action = null;
                selected.attribute = null;
                break;
            }
            case 'resource': {
                const selectedService = services.find((d) => d.name === selected.service);
                const selectedResource = selected.resource
                    ? selectedService.resources.find((d) => d.name === selected.resource)
                    : null;

                const availableActions = selectedResource
                    ? selectedResource.actions
                    : selectedService.actions;

                if (!availableActions.map((a) => a.name).includes(selected.action)) {
                    selected.action = null;
                    selected.attribute = null;
                } else {
                    const selectedAction = availableActions.find((d) => d.name === selected.action);

                    if (!selectedAction.attributes.includes(selected.attribute)) {
                        selected.attribute = null;
                    }
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
    let selected: Record<FieldType, string | null> = {
        service: null,
        resource: null,
        action: null,
        attribute: null
    };
    let helper: string = null;
    let inputData: string = null;
    let showInput = false;

    $: available = (function getAvailable() {
        const available: Record<`${FieldType}s`, Array<string>> = {
            services: services.map((d) => d.name),
            resources: [],
            actions: [],
            attributes: []
        };

        if (selected.service) {
            const selectedService = services.find((d) => d.name === selected.service);
            available.resources = selectedService.resources.map((d) => d.name);

            if (!selected.resource) {
                available.actions = selectedService.actions.map((d) => d.name);

                if (selected.action) {
                    available.attributes = selectedService.actions.find(
                        (d) => d.name === selected.action
                    ).attributes;
                }
            } else {
                const selectedResource = selectedService.resources.find(
                    (d) => d.name === selected.resource
                );
                available.actions = selectedResource.actions.map((d) => d.name);

                if (selected.action) {
                    available.attributes = selectedResource.actions.find(
                        (d) => d.name === selected.action
                    ).attributes;
                }
            }
        }

        return available;
    })();

    $: eventString = (function createEventString() {
        const data = new Map();

        let selectedAction: Action | null = null;
        if (selected.action) {
            const selectedService = services.find((d) => d.name === selected.service);
            if (selected.resource) {
                const selectedResource = selectedService.resources.find(
                    (d) => d.name === selected.resource
                );
                selectedAction = selectedResource.actions.find((d) => d.name === selected.action);
            } else {
                selectedAction = selectedService.actions.find((d) => d.name === selected.action);
            }
        }

        if (selected.service) {
            data.set('service', { value: selected.service, description: 'service' });
            data.set('serviceId', {
                value: '*',
                description: `ID of ${selected.service.slice(0, -1)}`
            });
        }

        if (selected.resource) {
            if (selected.resource === 'documents') {
                data.set('resource', {
                    value: 'collections',
                    description: 'resource'
                });
                data.set('resourceId', {
                    value: '*',
                    description: `ID of collection`
                });
                data.set('secondaryResource', {
                    value: 'documents',
                    description: 'secondary resource'
                });
                data.set('secondaryResourceId', {
                    value: '*',
                    description: `ID of document`
                });
            } else {
                data.set('resource', {
                    value: selected.resource,
                    description: `resource`
                });
                data.set('resourceId', {
                    value: '*',
                    description: `ID of ${selected.resource.slice(0, -1)}`
                });
            }
        }

        if (selected.action) {
            data.set('action', { value: selected.action, description: 'action' });
        }

        if (selected.attribute && !selected.resource) {
            data.set('attribute', { value: selected.attribute, description: 'attribute' });
        } else if (selectedAction?.attributes && !selected.resource) {
            data.set('attribute', { value: '*', description: `attribute` });
        }
        return data;
    })();

    $: copyValue =
        inputData ??
        Array.from(eventString.values())
            .map((d) => d.value)
            .join('.');

    $: if (!showInput) {
        helper = null;
    }

    $: if (!show) {
        selected.service = null;
        selected.resource = null;
        selected.action = null;
        selected.attribute = null;
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
                    selected={selected.service === service}
                    button
                    on:click={() => select('service', service)}>
                    {service}
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
                        selected={selected.resource === resource}
                        button
                        on:click={() => select('resource', resource)}>
                        {resource}
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
                        selected={selected.action === action}
                        button
                        on:click={() => select('action', action)}>
                        {action}
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
    <div>
        {JSON.stringify(selected, null, 2)}
    </div>
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
        <div class="input-text-wrapper" style="--amount-of-buttons:2">
            <div type="text" readonly style="min-height: 2.5rem;">
                {#if inputData}
                    <span>{inputData}</span>
                {:else}
                    {#each Array.from(eventString.values()) as route, i}
                        <button
                            class:u-opacity-0-5={helper !== route.description}
                            on:mouseenter={() => {
                                helper = route.description;
                            }}
                            on:mouseleave={() => {
                                helper = null;
                            }}>
                            {route.value}
                        </button>
                        <span class="u-opacity-0-5">
                            {i + 1 < eventString?.size ? '.' : ''}
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
                    <Copy value={copyValue}>
                        <span class="icon-duplicate" aria-hidden="true" />
                    </Copy>
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
