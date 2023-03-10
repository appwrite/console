<script lang="ts">
    import { Button } from '$lib/elements/forms';
    import { Modal, Copy } from '$lib/components';
    import { Pill } from '$lib/elements';
    import { createEventDispatcher } from 'svelte';

    export let show = false;

    type Service = {
        name: string;
        resources: Resource[];
        actions?: Action[];
    };

    type Resource = {
        name: string;
        actions?: Action[];
        attributes?: string[];
    };

    type Action = {
        name: string;
        attributes?: string[];
    };

    let selectedService: Service = null;
    let selectedResource: Resource = null;
    let selectedAction: Action = null;
    let selectedAttribute: string = null;
    let helper: string = null;
    let inputData: string = null;
    let showInput = false;

    const dispatch = createEventDispatcher();

    function create() {
        show = false;
        dispatch('created', copyValue);
    }

    const actions = [{ name: 'create' }, { name: 'update' }, { name: 'delete' }];

    const services = [
        {
            name: 'buckets',
            resources: [{ name: 'files', actions }],
            actions
        },
        {
            name: 'databases',
            resources: [
                { name: 'collections', actions },
                { name: 'documents', actions }
            ],
            actions
        },
        {
            name: 'functions',
            resources: [
                { name: 'deployments', actions },
                { name: 'executions', actions }
            ],
            actions
        },
        {
            name: 'teams',
            resources: [{ name: 'memberships', actions }],
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
        },
        {
            name: 'rules',
            resources: [],
            actions
        }
    ];

    function createEventString(
        service: Service,
        resource: Resource,
        action: Action,
        attribute: string
    ) {
        const data = new Map();
        if (service) {
            data.set('service', { value: service.name, description: 'service' });
            data.set('serviceId', {
                value: '*',
                description: `ID of ${service?.name.slice(0, -1)}`
            });
        }

        if (resource) {
            if (resource.name === 'documents') {
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
                    value: resource.name,
                    description: `resource`
                });
                data.set('resourceId', {
                    value: '*',
                    description: `ID of ${resource?.name.slice(0, -1)}`
                });
            }
        }

        if (action) {
            data.set('action', { value: action.name, description: 'action' });
        }

        if (attribute && !resource) {
            data.set('attribute', { value: attribute, description: 'attribute' });
        } else if (action?.attributes && !resource) {
            data.set('attribute', { value: '*', description: `attribute` });
        }
        return data;
    }

    $: eventString = createEventString(
        selectedService,
        selectedResource,
        selectedAction,
        selectedAttribute
    );
    $: copyValue =
        inputData ??
        Array.from(eventString.values())
            .map((d) => d.value)
            .join('.');

    $: if (selectedService) {
        selectedResource = null;
        selectedAction = null;
        selectedAttribute = null;
        helper = null;
    }

    $: if (!selectedAction?.attributes) {
        selectedAttribute = null;
    }

    $: if (!showInput) {
        helper = null;
    }

    $: if (!show) {
        selectedService = null;
        selectedResource = null;
        selectedAction = null;
        selectedAttribute = null;
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
            {#each services as service}
                <Pill
                    disabled={showInput}
                    selected={service.name === selectedService?.name}
                    button
                    on:click={() => {
                        selectedService = service;
                        inputData = null;
                    }}>{service.name}</Pill>
            {/each}
        </div>
    </div>
    {#if selectedService}
        {#if selectedService.resources.length > 0}
            <div>
                <p class="u-text">Choose a resource (optional)</p>
                <div class="u-flex u-gap-8 u-margin-block-start-8">
                    {#each selectedService.resources as resource}
                        <Pill
                            disabled={showInput}
                            selected={resource.name === selectedResource?.name}
                            button
                            on:click={() => {
                                selectedResource === resource
                                    ? (selectedResource = null)
                                    : (selectedResource = resource);
                                inputData = null;
                            }}>{resource.name}</Pill>
                    {/each}
                </div>
            </div>
        {/if}
        <div>
            <p class="u-text">Choose an action (optional)</p>
            <div class="u-flex u-gap-8 u-margin-block-start-8">
                {#each selectedResource?.actions ?? selectedService?.actions as action}
                    <Pill
                        disabled={showInput}
                        selected={selectedAction === action}
                        button
                        on:click={() => {
                            selectedAction === action
                                ? (selectedAction = null)
                                : (selectedAction = action);
                            inputData = null;
                        }}>{action.name}</Pill>
                {/each}
            </div>
        </div>
        {#if selectedAction?.attributes}
            <div>
                <p class="u-text">Choose an attribute (optional)</p>
                <div class="u-flex u-gap-8 u-margin-block-start-8">
                    {#each selectedAction.attributes as attribute}
                        <Pill
                            disabled={showInput}
                            selected={selectedAttribute === attribute}
                            button
                            on:click={() => {
                                selectedAttribute === attribute
                                    ? (selectedAttribute = null)
                                    : (selectedAttribute = attribute);
                                inputData = null;
                            }}>{attribute}</Pill>
                    {/each}
                </div>
            </div>
        {/if}
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
