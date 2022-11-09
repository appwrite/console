<script lang="ts">
    import { Button } from '$lib/elements/forms';
    import { Modal, Copy } from '$lib/components';
    import { Pill } from '$lib/elements';
    import { createEventDispatcher } from 'svelte';

    export let show = false;
    let selectedService: typeof services[0] = null;
    let selectedRequest: typeof selectedService['requests'][0] = null;
    let selectedEvent: string = null;
    let selectedAttribute: string = null;
    let helper: string = null;
    let inputData: string = null;
    let showInput = false;

    const dispatch = createEventDispatcher();

    function create() {
        show = false;
        dispatch('created', copyValue);
    }

    const events = ['create', 'update', 'delete'];

    const services = [
        {
            name: 'buckets',
            requests: [{ name: 'files', events }],
            events
        },
        {
            name: 'databases',
            requests: [
                { name: 'collections', events },
                { name: 'documents', events }
            ],
            events
        },
        {
            name: 'functions',
            requests: [
                { name: 'deployments', events },
                { name: 'executions', events }
            ],
            events
        },
        {
            name: 'teams',
            requests: [{ name: 'memberships', events }],
            events
        },
        {
            name: 'users',
            requests: [
                { name: 'recovery', events: ['create', 'delete'] },
                { name: 'sessions', events: ['create', 'delete'] },
                { name: 'verifications', events: ['create', 'delete'] }
            ],
            events,
            attributes: ['email', 'name', 'password', 'status', 'prefs']
        }
    ];

    function createEventString(
        service: typeof selectedService,
        request: typeof selectedRequest,
        event: string,
        attribute: string
    ) {
        const data = new Map();
        //SERVICE
        if (service) {
            data.set('service', { value: service.name, description: 'service' });
            data.set('serviceId', {
                value: '*',
                description: `ID of ${service?.name.slice(0, -1)}`
            });
        }

        //REQUEST
        if (request) {
            if (request.name === 'documents') {
                data.set('request', {
                    value: 'collections',
                    description: 'request'
                });
                data.set('requestId', {
                    value: '*',
                    description: `ID of collection`
                });
                data.set('secondaryRequest', {
                    value: 'documents',
                    description: 'secondary request'
                });
                data.set('secondaryRequestId', {
                    value: '*',
                    description: `ID of document`
                });
            } else {
                data.set('request', {
                    value: request.name,
                    description: `request`
                });
                data.set('requestId', {
                    value: '*',
                    description: `ID of ${request?.name.slice(0, -1)}`
                });
            }
        }

        //EVENT
        if ((event && request?.events?.includes(event)) ?? service?.events?.includes(event)) {
            data.set('event', { value: event, description: 'event' });
        }

        //ATTRIBUTE
        if (attribute && !request) {
            data.set('attribute', { value: attribute, description: 'attribute' });
        } else if (event && service.name === 'users' && !request) {
            data.set('attribute', { value: '*', description: `attribute` });
        }
        return data;
    }

    $: eventString = createEventString(
        selectedService,
        selectedRequest,
        selectedEvent,
        selectedAttribute
    );
    $: copyValue =
        inputData ??
        Array.from(eventString.values())
            .map((d) => d.value)
            .join('.');

    $: if (selectedService) {
        selectedRequest = null;
        selectedEvent = null;
        selectedAttribute = null;
        helper = null;
    }
    $: if (!showInput) {
        helper = null;
    }

    $: if (!show) {
        selectedService = null;
        selectedRequest = null;
        selectedEvent = null;
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
        <div>
            <p class="u-text">Choose a request (optional)</p>
            <div class="u-flex u-gap-8 u-margin-block-start-8">
                {#each selectedService.requests as request}
                    <Pill
                        disabled={showInput}
                        selected={request.name === selectedRequest?.name}
                        button
                        on:click={() => {
                            selectedRequest === request
                                ? (selectedRequest = null)
                                : (selectedRequest = request);
                            inputData = null;
                        }}>{request.name}</Pill>
                {/each}
            </div>
        </div>
        <div>
            <p class="u-text">Choose an event (optional)</p>
            <div class="u-flex u-gap-8 u-margin-block-start-8">
                {#each selectedRequest?.events ?? selectedService?.events as event}
                    <Pill
                        disabled={showInput}
                        selected={selectedEvent === event}
                        button
                        on:click={() => {
                            selectedEvent === event
                                ? (selectedEvent = null)
                                : (selectedEvent = event);
                            inputData = null;
                        }}>{event}</Pill>
                {/each}
            </div>
        </div>
        {#if selectedService?.name === 'users' && !selectedRequest?.name}
            <div>
                <p class="u-text">Choose an attribute (optional)</p>
                <div class="u-flex u-gap-8 u-margin-block-start-8">
                    {#each selectedService?.attributes as attribute}
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
