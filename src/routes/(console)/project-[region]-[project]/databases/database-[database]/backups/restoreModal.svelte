<script lang="ts">
    import { onMount } from 'svelte';
    import { trackEvent } from '$lib/actions/analytics';
    import { InnerModal } from '$lib/components';
    import { FormItem } from '$lib/elements/forms';
    import TextCounter from '$lib/elements/forms/textCounter.svelte';

    export let id: string;
    export let show = false;
    export let name: string;
    export let autofocus = true;
    export let fullWidth = false;
    export let databaseId: string;

    let icon = 'info';
    let element: HTMLInputElement;
    const pattern = String.raw`^[a-zA-Z0-9][a-zA-Z0-9._\-]*$`;

    onMount(() => {
        if (element && autofocus) {
            element.focus();
        }
    });

    $: if (!show) {
        id = null;
    }

    const handleInvalid = (event: Event) => {
        event.preventDefault();

        if (element.validity.patternMismatch) {
            icon = 'exclamation';
            return;
        }
    };

    $: if (show) {
        trackEvent('click_show_custom_id');
    }

    $: if (id === databaseId) {
        icon = 'exclamation';
        element?.setCustomValidity('Database ID must be different from the one being restored.');
    } else {
        icon = 'info';
        element?.setCustomValidity('');
    }

    $: if (id?.length) {
        icon = 'info';
    } else {
        id = null;
    }
</script>

<InnerModal bind:show {fullWidth}>
    <svelte:fragment slot="title">{name} ID</svelte:fragment>
    <svelte:fragment slot="subtitle">
        Enter a custom {name} ID. Leave blank for a randomly generated one.
    </svelte:fragment>
    <svelte:fragment slot="content">
        <div class="form u-gap-8">
            <FormItem>
                <div class="input-text-wrapper">
                    <input
                        id="id"
                        placeholder="Enter ID"
                        maxlength={36}
                        {pattern}
                        autocomplete="off"
                        type="text"
                        class="input-text"
                        bind:value={id}
                        bind:this={element}
                        on:invalid={handleInvalid} />
                    <TextCounter count={id?.length ?? 0} max={36} />
                </div>
            </FormItem>
            <div
                class="u-flex u-gap-4 u-margin-block-start-8 u-small"
                class:u-color-text-warning={icon === 'exclamation'}>
                <span
                    class:icon-info={icon === 'info'}
                    class:icon-exclamation={icon === 'exclamation'}
                    class="u-cross-center u-line-height-1 u-color-text-gray"
                    aria-hidden="true" />
                <span class="text u-line-height-1-5">
                    Allowed characters: alphanumeric, non-leading hyphen, underscore, period.
                    Database ID must be different from the one being restored.
                </span>
            </div>
        </div>
    </svelte:fragment>
</InnerModal>
