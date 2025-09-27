<script lang="ts">
    import { invalidate } from '$app/navigation';
    import { page } from '$app/state';
    import { Submit, trackEvent, trackError } from '$lib/actions/analytics';
    import { Modal, CustomId } from '$lib/components';
    import { Dependencies } from '$lib/constants';
    import { Badge, Icon } from '@appwrite.io/pink-svelte';
    import { IconPencil } from '@appwrite.io/pink-icons-svelte';
    import { Button, InputText, InputSelect, InputPhone } from '$lib/elements/forms';
    import InputEmail from '$lib/elements/forms/inputEmail.svelte';
    import { addNotification } from '$lib/stores/notifications';
    import { sdk } from '$lib/stores/sdk';
    import { ID, MessagingProviderType } from '@appwrite.io/console';

    export let show = false;

    let providerType = MessagingProviderType.Push;
    let identifier = '';
    let name = '';
    let providerId = '';
    let id: string = null;
    let showCustomId = false;

    const providerTypeOptions = [
        { label: 'Push', value: MessagingProviderType.Push },
        { label: 'Email', value: MessagingProviderType.Email },
        { label: 'SMS', value: MessagingProviderType.Sms }
    ];

    const create = async () => {
        try {
            await sdk.forProject(page.params.region, page.params.project).users.createTarget({
                userId: page.params.user,
                targetId: id ? id : ID.unique(),
                providerType,
                identifier,
                providerId: providerId ?? undefined,
                name: name ?? undefined
            });
            show = false;
            addNotification({
                type: 'success',
                message: `Target has been created`
            });
            name = id = null;
            invalidate(Dependencies.USER_TARGETS);
            trackEvent(Submit.UserTargetCreate, {
                customId: !!id,
                providerType: providerType
            });
        } catch (error) {
            addNotification({
                type: 'error',
                message: error.message
            });
            trackError(error, Submit.UserTargetCreate);
        }
    };

    // Ensure values are reset when modal is opened
    $: if (show) {
        showCustomId = false;
        providerType = MessagingProviderType.Push;
        identifier = '';
        name = '';
        providerId = '';
        id = null;
    }

    $: if (providerType) {
        identifier = '';
    }
</script>

<Modal title="Create target" size="l" bind:show onSubmit={create}>
    <InputSelect
        id="provider-type"
        label="Provider Type"
        bind:value={providerType}
        options={providerTypeOptions} />
    {#if providerType === MessagingProviderType.Push}
        <InputText
            id="provider-id"
            label="Provider ID"
            placeholder="Enter provider ID"
            bind:value={providerId}
            required />
        <InputText
            id="identifier"
            label="Identifier"
            placeholder="Enter push token"
            bind:value={identifier}
            required />
        <InputText
            id="name"
            label="Name"
            placeholder="Enter target name"
            bind:value={name}
            required />
    {:else if providerType === MessagingProviderType.Email}
        <InputEmail
            id="identifier"
            label="Identifier"
            placeholder="Enter email"
            bind:value={identifier}
            required />
    {:else if providerType === MessagingProviderType.Sms}
        <InputPhone
            id="identifier"
            label="Identifier"
            placeholder="Enter phone number"
            bind:value={identifier}
            required />
    {/if}

    {#if !showCustomId}
        <div>
            <Badge
                variant="secondary"
                content="Target ID"
                on:click={() => (showCustomId = !showCustomId)}>
                <Icon icon={IconPencil} size="s" slot="start" />
            </Badge>
        </div>
    {:else}
        <CustomId bind:show={showCustomId} name="Target" bind:id autofocus={false} />
    {/if}

    <svelte:fragment slot="footer">
        <Button secondary on:click={() => (show = false)}>Cancel</Button>
        <Button submit>Create</Button>
    </svelte:fragment>
</Modal>
