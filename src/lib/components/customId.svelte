<script lang="ts">
    import { trackEvent } from '$lib/actions/analytics';
    import { InnerModal } from '$lib/components';
    import { InputId } from '$lib/elements/forms';

    export let show = false;
    export let name: string;
    export let id: string;
    export let autofocus = true;
    export let fullWidth = false;

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

<InnerModal bind:show {fullWidth}>
    <svelte:fragment slot="title">{name} ID</svelte:fragment>
    <svelte:fragment slot="subtitle">
        Enter a custom {name} ID. Leave blank for a randomly generated one.
    </svelte:fragment>
    <svelte:fragment slot="content">
        <div class="form">
            <InputId bind:value={id} {autofocus} />
        </div>
    </svelte:fragment>
</InnerModal>
