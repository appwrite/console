<script lang="ts">
    import { Button, Form } from '$lib/elements/forms';
    import { Modal } from '$lib/components';
    import { createEventDispatcher } from 'svelte';
    import { addNotification } from '$lib/stores/notifications';
    import { Pill } from '$lib/elements';

    export let showCreate = false;
    let selectedService: typeof services[0] = null;
    let selectedRequest: any;
    let selectedEvent: string = null;
    let selectedAttribute: string = null;

    const dispatch = createEventDispatcher();

    const create = async () => {
        try {
            showCreate = false;
            dispatch('created');
        } catch (error) {
            addNotification({
                type: 'error',
                message: error.message
            });
        }
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
</script>

<Form on:submit={create}>
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
            {selectedService?.name}.{selectedRequest?.name}.{selectedEvent}
        {/if}

        <svelte:fragment slot="footer">
            <Button secondary on:click={() => (showCreate = false)}>Cancel</Button>
            <Button submit>Create</Button>
        </svelte:fragment>
    </Modal>
</Form>
