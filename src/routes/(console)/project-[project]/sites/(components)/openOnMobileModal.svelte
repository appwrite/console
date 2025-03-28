<script lang="ts">
    import { Modal } from '$lib/components';
    import Card from '$lib/components/card.svelte';
    import { InputText } from '$lib/elements/forms';
    import { copy } from '$lib/helpers/copy';
    import { sdk } from '$lib/stores/sdk';
    import { protocol } from '$routes/(console)/store';
    import { IconDuplicate } from '@appwrite.io/pink-icons-svelte';
    import { Image, Input, Layout } from '@appwrite.io/pink-svelte';
    import { onMount } from 'svelte';

    export let show = false;
    export let siteURL: string;

    let url = $protocol + siteURL;

    let image = '';
    onMount(() => {
        image = sdk.forProject.avatars.getQR(url, 352);
    });
</script>

<Modal title="Open on mobile" bind:show hideFooter>
    <span slot="description">Open the preview of your site on any mobile or tablet device.</span>
    <Layout.Stack gap="l">
        <Card padding="l" radius="l">
            <Layout.Stack justifyContent="center" alignItems="center">
                <Image src={image} height={176} width={176} alt="QR code" radius="xxs" />
            </Layout.Stack>
        </Card>
        <InputText id="copy" value={url} readonly>
            <svelte:fragment slot="end">
                <Input.Action icon={IconDuplicate} on:click={() => copy(url)} />
            </svelte:fragment>
        </InputText>
    </Layout.Stack>
</Modal>
