<script lang="ts">
    import { Button, Form } from '$lib/elements/forms';
    import { Modal } from '$lib/components';
    import { Pill } from '$lib/elements';
    import { createFunction } from './wizard/store';

    export let showCreate = false;
    let selectedService: typeof services[0] = null;
    let selectedRequest: typeof selectedService['requests'][0] = null;
    let selectedEvent: string = null;
    let selectedAttribute: string = null;
    let showInfo: string = null;

    const create = () => {
        showCreate = false;
        const data = eventString.map((d) => d.value).join('.');
        $createFunction.events.push(data);
        $createFunction = $createFunction;
    };

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
        let data = [];
        //SERVICE
        if (service) {
            data.push({ value: service.name, description: 'service' });
            data.push({ value: '*', description: `event` });
        }

        //REQUEST
        if (request) {
            data.push({ value: request.name, description: 'request' });
            data[1].description = `ID of ${service?.name.slice(0, -1)}`;
            data.push({ value: '*', description: `event` });
        }

        //EVENT
        if ((event && request?.events?.includes(event)) ?? service?.events?.includes(event)) {
            data[data.length - 1] = { value: event, description: 'event' };
        } else if (service) {
            data[data.length - 1] = { value: '*', description: 'event' };
        }

        //ATTRIBUTE
        if (attribute && !request) {
            data.push({ value: attribute, description: 'attribute' });
        }
        return data;
    }

    $: eventString = createEventString(
        selectedService,
        selectedRequest,
        selectedEvent,
        selectedAttribute
    );

    $: if (selectedService) {
        selectedRequest = null;
        selectedEvent = null;
        selectedAttribute = null;
    }

    $: console.log(eventString);
</script>

<Form single on:submit={create}>
    <Modal bind:show={showCreate} size="big">
        <svelte:fragment slot="header">Create Event</svelte:fragment>

        <div>
            <p class="u-text">Choose a service</p>
            <div class="u-flex u-gap-8 u-margin-block-start-8">
                {#each services as service}
                    <Pill
                        selected={service.name === selectedService?.name}
                        button
                        on:click={() => (selectedService = service)}>{service.name}</Pill>
                {/each}
            </div>
        </div>
        {#if selectedService}
            <div>
                <p class="u-text">Choose a request (optional)</p>
                <div class="u-flex u-gap-8 u-margin-block-start-8">
                    {#each selectedService.requests as request}
                        <Pill
                            selected={request.name === selectedRequest?.name}
                            button
                            on:click={() => {
                                selectedRequest === request
                                    ? (selectedRequest = null)
                                    : (selectedRequest = request);
                            }}>{request.name}</Pill>
                    {/each}
                </div>
            </div>
            <div>
                <p class="u-text">Choose an event (optional)</p>
                <div class="u-flex u-gap-8 u-margin-block-start-8">
                    {#each selectedRequest?.events ?? selectedService?.events as event}
                        <Pill
                            selected={selectedEvent === event}
                            button
                            on:click={() => {
                                selectedEvent === event
                                    ? (selectedEvent = null)
                                    : (selectedEvent = event);
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
                                selected={selectedAttribute === attribute}
                                button
                                on:click={() => {
                                    selectedAttribute === attribute
                                        ? (selectedAttribute = null)
                                        : (selectedAttribute = attribute);
                                }}>{attribute}</Pill>
                        {/each}
                    </div>
                </div>
            {/if}
            <div class="u-flex">
                {#each eventString as route, i}
                    <button
                        on:click|preventDefault={() => {
                            showInfo === route.description
                                ? (showInfo = null)
                                : (showInfo = route.description);
                        }}>{route.value}{i + 1 < eventString?.length ? '.' : ''}</button>
                {/each}
            </div>
            {#if showInfo}
                <span>{showInfo}</span>
            {/if}
        {/if}

        <svelte:fragment slot="footer">
            <Button secondary on:click={() => (showCreate = false)}>Cancel</Button>
            <Button submit>Create</Button>
        </svelte:fragment>
    </Modal>
</Form>
