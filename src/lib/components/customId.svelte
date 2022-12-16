<script lang="ts">
    import { trackEvent } from '$lib/actions/analytics';
    import { InnerModal } from '$lib/components';
    import { InputText } from '$lib/elements/forms';

    export let show = false;
    export let name: string;
    export let id: string | null;

    $: if (!show) {
        id = null;
    }

    $: if (!id?.length) {
        id = null;
    }

    $: if (show) {
        trackEvent('click_show_custom_id');
    }
</script>

<InnerModal bind:show>
    <svelte:fragment slot="title">{name} ID</svelte:fragment>
    <svelte:fragment slot="subtitle">
        Enter a custom {name} ID. Leave blank for a randomly generated one.
    </svelte:fragment>
    <svelte:fragment slot="content">
        <div class="form">
            <InputText
                id="id"
                label="Custom ID"
                showLabel={false}
                placeholder="Enter ID"
                autofocus={true}
                bind:value={id} />

            <div class="u-flex u-gap-4 u-margin-block-start-8 u-small">
                <span
                    class="icon-info u-cross-center u-margin-block-start-2 u-line-height-1 u-icon-small"
                    aria-hidden="true" />
                <span class="text u-line-height-1-5">
                    Allowed characters: alphanumeric, hyphen, non-leading underscore, period
                </span>
            </div>
        </div>
    </svelte:fragment>
</InnerModal>
