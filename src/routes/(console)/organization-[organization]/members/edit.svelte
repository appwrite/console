<script lang="ts">
    import { Modal } from '$lib/components';
    import { Button } from '$lib/elements/forms';
    import { addNotification } from '$lib/stores/notifications';
    import { sdk } from '$lib/stores/sdk';
    import { createEventDispatcher } from 'svelte';
    import { organization } from '$lib/stores/organization';
    import { invalidate } from '$app/navigation';
    import { Dependencies } from '$lib/constants';
    import { Submit, trackEvent, trackError } from '$lib/actions/analytics';
    import InputSelect from '$lib/elements/forms/inputSelect.svelte';
    import type { Models } from '@appwrite.io/console';
    import Roles from '$lib/components/roles/roles.svelte';
    import { IconInfo } from '@appwrite.io/pink-icons-svelte';
    import { Icon, Layout, Popover } from '@appwrite.io/pink-svelte';

    export let showEdit = false;
    export let selectedMember: Models.Membership;

    const dispatch = createEventDispatcher();

    let error: string;
    let role = selectedMember?.roles?.[0];

    const roles = [
        {
            label: 'Owner',
            value: 'owner'
        },
        {
            label: 'Developer',
            value: 'developer'
        },
        {
            label: 'Editor',
            value: 'editor'
        },
        {
            label: 'Analyst',
            value: 'analyst'
        },
        {
            label: 'Billing',
            value: 'billing'
        },
        {
            label: 'Designer',
            value: 'designer'
        }
    ];

    async function submit() {
        try {
            const membership = await sdk.forConsole.teams.updateMembership(
                $organization.$id,
                selectedMember.$id,
                [role]
            );
            await invalidate(Dependencies.ACCOUNT);
            await invalidate(Dependencies.ORGANIZATION);
            await invalidate(Dependencies.MEMBERS);

            showEdit = false;
            addNotification({
                type: 'success',
                message: `Role has been updated`
            });
            trackEvent(Submit.MembershipUpdate);
            dispatch('updated', membership);
        } catch (e) {
            error = e.message;
            trackError(e, Submit.MembershipUpdate);
        }
    }

    $: if (!showEdit) {
        error = null;
        role = null;
    }

    $: if (showEdit && !role) {
        role = selectedMember.roles?.[0];
    }
</script>

<Modal title="Edit role" {error} size="s" bind:show={showEdit} onSubmit={submit}>
    <InputSelect id="role" label="Role" required options={roles} bind:value={role}>
        <Layout.Stack direction="row" gap="none" alignItems="center" slot="info">
            <Popover let:toggle>
                <Button extraCompact size="s" on:click={toggle}>
                    <Icon size="s" icon={IconInfo} />
                </Button>
                <svelte:component this={Roles} slot="tooltip" />
            </Popover>
        </Layout.Stack>
    </InputSelect>

    <svelte:fragment slot="footer">
        <Button secondary on:click={() => (showEdit = false)}>Cancel</Button>
        <Button submit submissionLoader>Update</Button>
    </svelte:fragment>
</Modal>
