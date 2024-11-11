<script lang="ts">
    import { Modal } from '$lib/components';
    import Card from '$lib/components/card.svelte';
    import { Button, InputText } from '$lib/elements/forms';
    import { copy } from '$lib/helpers/copy';
    import { sdk } from '$lib/stores/sdk';
    import { IconDuplicate } from '@appwrite.io/pink-icons-svelte';
    import { Image, Input, Layout } from '@appwrite.io/pink-svelte';
    import { onMount } from 'svelte';
    export let show = false;
    export let siteURL: string;

    let image = '';
    onMount(() => {
        image = sdk.forProject.avatars.getQR(siteURL, 352);
    });
</script>

<Modal
    title="Open on mobile"
    description="Open the preview of your site on any mobile or tablet device"
    bind:show>
    <Layout.Stack gap="l">
        <Card>
            <Layout.Stack justifyContent="center" alignItems="center">
                <Image src={image} height={176} width={176} alt="QR code" />
            </Layout.Stack>
        </Card>
        <InputText id="copy" value={siteURL} readonly>
            <svelte:fragment slot="end">
                <Input.Action icon={IconDuplicate} on:click={() => copy(siteURL)} />
            </svelte:fragment>
        </InputText>
    </Layout.Stack>
    <svelte:fragment slot="footer">
        <Button secondary on:click={() => (show = false)}>Cancel</Button>
    </svelte:fragment>
</Modal>
