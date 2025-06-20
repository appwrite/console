<script lang="ts">
    import { Button } from '$lib/elements/forms';
    import { Modal } from '$lib/components';
    import { Pill } from '$lib/elements';
    import { createEventDispatcher } from 'svelte';
    import { at, empty } from '$lib/helpers/array';
    import { singular } from '$lib/helpers/string';
    import {
        eventServices as services,
        type EventAction,
        type EventResource,
        type EventService
    } from '$lib/constants';
    import { Tooltip, Input, Tag, Layout, Typography } from '@appwrite.io/pink-svelte';
    import { trackEvent } from '$lib/actions/analytics';
    import { IconCheck, IconDuplicate, IconPencil, IconX } from '@appwrite.io/pink-icons-svelte';

    // Props
    export let show = false;
    export let initialValue = '';

    // Constants
    const serviceNames = services.map((s) => s.name);
    const resourceNames = services.flatMap((s) => s.resources.map((r) => r.name));
    const actionNames = [
        ...services.flatMap((s) => s.actions.map((a) => a.name)),
        ...services.flatMap((s) => s.resources.flatMap((r) => r.actions.map((a) => a.name)))
    ];
    const attributeNames = [
        ...services.flatMap((s) => s.actions.flatMap((a) => a.attributes ?? [])),
        ...services.flatMap((s) =>
            s.resources.flatMap((r) => r.actions.flatMap((a) => a.attributes ?? []))
        )
    ];

    // Helpers
    const isService = (s: string) => serviceNames.includes(s);
    const isResource = (s: string) => resourceNames.includes(s);
    const isAction = (s: string) => actionNames.includes(s);
    const isAttribute = (s: string) => attributeNames.includes(s);

    const dispatch = createEventDispatcher();

    function create() {
        show = false;
        trackEvent('events_add', {
            value: inputValue
        });
        dispatch('created', inputValue);
    }

    function select(field: 'service', value: EventService): void;
    function select(field: 'resource', value: EventResource): void;
    function select(field: 'action', value: EventAction): void;
    function select(field: 'attribute', value: string): void;
    function select(
        field: string,
        value: string | EventService | EventResource | EventAction
    ): void {
        if (typeof value === 'string') {
            selected[field as 'attribute'] = selected[field] === value ? null : value;
        } else {
            selected[field] = selected[field]?.name === value.name ? null : value;
        }

        customInput = null;

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

                // We need to check if the selected action name is still
                // on the available list, and if so, change the action to the
                // appropriate one, as it may contain different attributes
                const availableAction = availableActions.find(
                    (a) => a.name === selected.action?.name
                );

                if (!availableAction) {
                    selected.action = null;
                    selected.attribute = null;
                } else {
                    selected.action = availableAction;

                    if (!selected?.action?.attributes?.includes(selected.attribute)) {
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

    function resetSelected() {
        Object.keys(selected).forEach((key) => (selected[key] = null));
    }

    function inferSelectedFromCustomInput() {
        resetSelected();
        for (const field of customInput.split('.')) {
            if (isService(field)) {
                selected.service = services.find((s) => s.name === field);
            } else if (isResource(field)) {
                const resource = selected.service?.resources.find((r) => r.name === field);
                selected.resource = resource;
            } else if (isAction(field)) {
                const action =
                    selected.resource?.actions.find((a) => a.name === field) ||
                    selected.service?.actions.find((a) => a.name === field);
                selected.action = action;
            } else if (isAttribute(field)) {
                const attribute = selected.action?.attributes?.find((a) => a === field);
                selected.attribute = attribute;
            }
        }
    }

    function toggleShowInput(e: Event) {
        e.preventDefault();

        showInput = !showInput;
        if (showInput) return;

        helper = null;
        inferSelectedFromCustomInput();
    }

    function getHelperStr(fields: string[], index: number) {
        const currField = at(fields, index);
        const prevField = at(fields, index - 1);
        const secondToLastField = at(fields, index - 2);

        if (index === 0 || isService(currField)) return 'service';
        if (isAttribute(currField) || isAction(prevField)) return 'attribute';
        if (isAction(currField)) return 'action';
        if (isResource(currField)) return 'resource';
        if (isService(prevField) || isResource(prevField) || index === 1) {
            return `ID of ${singular(prevField)}`;
        }
        // TODO: Find better name for 'resource or action'
        if (isService(secondToLastField) || index === 2) return 'resource or action';
        if (isResource(secondToLastField)) return 'action';

        return '';
    }

    function getCustomInputHelperStr(input: string, selectionStart?: number): string {
        const fields = input.split('.');
        let fieldIndex = -1;

        if (selectionStart > -1) {
            let currentIndex = 0;
            let arrayIndex = 0;

            for (const item of fields) {
                currentIndex += item.length + 1;
                if (currentIndex > selectionStart) {
                    fieldIndex = arrayIndex;
                    break;
                }
                arrayIndex++;
            }
        }

        return getHelperStr(fields, fieldIndex);
    }

    // State & Reactive Declarations
    let selected = {
        service: null as EventService | null,
        resource: null as EventResource | null,
        action: null as EventAction | null,
        attribute: null as string | null
    };
    let helper: string = null;
    let customInput: string = null;
    let customInputCursor = -1;
    let showInput = false;

    $: if (show && initialValue) {
        customInput = initialValue;
        inferSelectedFromCustomInput();
    }

    $: available = {
        services: services,
        resources: selected.service?.resources || [],
        actions: (selected.resource ? selected.resource?.actions : selected.service?.actions) || [],
        attributes: selected.action?.attributes || []
    };

    $: eventString = (function createEventString(): Array<{ value: string; description: string }> {
        let fields: string[] = [];

        // Avoid calculating the event string if the user is typing, as it is not shown
        if (showInput) return [];
        if (customInput) {
            fields = customInput.split('.');
        } else {
            if (selected.service) {
                fields.push(selected.service.name, '*');
            }
            // TODO: change collections and documents terminology later
            if (selected.resource?.name === 'documents') {
                fields.push('collections', '*');
            }
            if (selected.resource) {
                fields.push(selected.resource.name, '*');
            }
            if (selected.action) {
                fields.push(selected.action.name);
            }
            if (selected.attribute) {
                fields.push(selected.attribute);
            }
        }

        return fields.map((value, i, arr) => ({ value, description: getHelperStr(arr, i) }));
    })();

    $: inputValue = eventString.map((d) => d.value).join('.');

    $: if (!show) {
        resetSelected();
        customInput = null;
        showInput = false;
    }

    $: if (showInput) {
        helper = getCustomInputHelperStr(customInput, customInputCursor);
    }
</script>

<Modal title="Create event" bind:show onSubmit={create}>
    <slot />
    <Layout.Stack gap="s">
        <Typography.Text variant="m-500">Choose a service</Typography.Text>
        <Layout.Stack gap="s" wrap="wrap" direction="row">
            {#each available.services as service}
                <Tag
                    disabled={showInput}
                    selected={selected.service?.name === service.name}
                    on:click={() => select('service', service)}>
                    {service.name}
                </Tag>
            {/each}
        </Layout.Stack>
    </Layout.Stack>

    {#if !empty(available.resources)}
        <Layout.Stack gap="s">
            <Typography.Text variant="m-500">Choose a resource (optional)</Typography.Text>
            <Layout.Stack gap="s" wrap="wrap" direction="row">
                {#each available.resources as resource}
                    <Tag
                        disabled={showInput}
                        selected={selected.resource?.name === resource.name}
                        on:click={() => select('resource', resource)}>
                        {resource.name}
                    </Tag>
                {/each}
            </Layout.Stack>
        </Layout.Stack>
    {/if}

    {#if !empty(available.actions)}
        <Layout.Stack gap="s">
            <Typography.Text variant="m-500">Choose an action (optional)</Typography.Text>
            <Layout.Stack gap="s" wrap="wrap" direction="row">
                {#each available.actions as action}
                    <Tag
                        disabled={showInput}
                        selected={selected.action?.name === action.name}
                        on:click={() => select('action', action)}>
                        {action.name}
                    </Tag>
                {/each}
            </Layout.Stack>
        </Layout.Stack>
    {/if}

    {#if !empty(available.attributes)}
        <Layout.Stack gap="s">
            <Typography.Text variant="m-500">Choose an attribute (optional)</Typography.Text>
            <Layout.Stack gap="s" wrap="wrap" direction="row">
                {#each available.attributes as attribute}
                    <Pill
                        disabled={showInput}
                        selected={selected.attribute === attribute}
                        button
                        on:click={() => select('attribute', attribute)}>
                        {attribute}
                    </Pill>
                {/each}
            </Layout.Stack>
        </Layout.Stack>
    {/if}

    {#if showInput}
        <Layout.Stack gap="s">
            <Input.Text bind:value={customInput} placeholder="Enter custom event">
                <svelte:fragment slot="end">
                    <Input.Action icon={IconCheck} on:click={toggleShowInput} />
                    <Input.Action icon={IconX} />
                </svelte:fragment>
            </Input.Text>

            <!-- TODO: get checked by design -->
            <Typography.Caption variant="400">{helper ?? ''}</Typography.Caption>
        </Layout.Stack>
    {:else}
        <Input.Text
            value={eventString.map((e) => e.value).join('.')}
            placeholder="Enter custom event"
            readonly>
            <svelte:fragment slot="end">
                <Tooltip>
                    <Input.Action
                        icon={IconPencil}
                        on:click={(e) => {
                            customInput = inputValue;
                            toggleShowInput(e);
                        }} />
                    <div slot="tooltip">Edit event</div>
                </Tooltip>
                <Input.Action icon={IconDuplicate} />
            </svelte:fragment>
        </Input.Text>
    {/if}

    <svelte:fragment slot="footer">
        <Button secondary on:click={() => (show = false)}>Cancel</Button>
        <Button disabled={showInput || !inputValue} submit
            >{initialValue ? 'Update' : 'Create'}</Button>
    </svelte:fragment>
</Modal>
