<script lang="ts">
    import { invalidate } from '$app/navigation';
    import { page } from '$app/stores';
    import { Submit, trackEvent, trackError } from '$lib/actions/analytics';
    import { Modal, CustomId } from '$lib/components';
    import { Dependencies } from '$lib/constants';
    import { Pill } from '$lib/elements';
    import { Button, InputText, FormList, InputSelect, InputPhone } from '$lib/elements/forms';
    import InputEmail from '$lib/elements/forms/inputEmail.svelte';
    import { addNotification } from '$lib/stores/notifications';
    import { sdk } from '$lib/stores/sdk';
    import { ProviderTypes } from '$routes/console/project-[project]/messaging/providerType.svelte';
    import { ID } from '@appwrite.io/console';

    export let show = false;

    let providerType = ProviderTypes.Push;
    let identifier = '';
    let name = '';
    let providerId = '';
    let id: string = null;
    let showCustomId = false;

    const providerTypeOptions = [
        { label: 'Push', value: ProviderTypes.Push },
        { label: 'Email', value: ProviderTypes.Email },
        { label: 'SMS', value: ProviderTypes.Sms },
    ];

    const create = async () => {
        try {
            const payload = {
                targetId: id ? id : ID.unique(),
                providerType,
                identifier
            };

            if (providerId) {
                payload['providerId'] = providerId;
            }

            if (name) {
                payload['name'] = name;
            }

            await sdk.forProject.client.call(
                'POST',
                new URL(
                    `${sdk.forProject.client.config.endpoint}/users/${$page.params.user}/targets`
                ),
                {
                    'X-Appwrite-Project': sdk.forProject.client.config.project,
                    'content-type': 'application/json',
                    'X-Appwrite-Mode': 'admin'
                },
                payload,
            );
            show = false;
            addNotification({
                type: 'success',
                message: `Target has been created`
            });
            name = id = null;
            invalidate(Dependencies.USER_TARGETS);
            trackEvent(Submit.UserTargetCreate, {
                customId: !!id,
                providerType: providerType,
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
        providerType = ProviderTypes.Push;
        identifier = '';
        name = '';
        providerId = '';
        id = null;
    }

    $: if (providerType) {
        identifier = '';
    }
</script>

<Modal title="Create target" size="big" bind:show onSubmit={create}>
    <FormList>
        <InputSelect id="provider-type" label="Provider Type" bind:value={providerType} options={providerTypeOptions} />
        {#if providerType === ProviderTypes.Push}
            <InputText
                id="provider-id"
                label="Provider ID"
                placeholder='Enter provider ID'
                bind:value={providerId}
                required />
            <InputText
                id="identifier"
                label="Identifier"
                placeholder='Enter push token'
                bind:value={identifier}
                required />
            <InputText
                id="name"
                label="Name"
                placeholder="Enter target name"
                bind:value={name}
                required />
        {:else if providerType === ProviderTypes.Email}
            <InputEmail
                id="identifier"
                label="Identifier"
                placeholder='Enter email'
                bind:value={identifier}
                required />
        {:else if providerType === ProviderTypes.Sms}
            <InputPhone
                id="identifier"
                label="Identifier"
                placeholder='Enter phone number'
                bind:value={identifier}
                required />
        {/if}

        {#if !showCustomId}
            <div>
                <Pill button on:click={() => (showCustomId = !showCustomId)}
                    ><span class="icon-pencil" aria-hidden="true" /><span class="text">
                        Target ID
                    </span></Pill>
            </div>
        {:else}
            <CustomId bind:show={showCustomId} name="Target" bind:id autofocus={false} />
        {/if}
    </FormList>
    <svelte:fragment slot="footer">
        <Button secondary on:click={() => (show = false)}>Cancel</Button>
        <Button submit>Create</Button>
    </svelte:fragment>
</Modal>
