<script lang="ts">
    import { Modal } from '$lib/components';
    import { Button } from '$lib/elements/forms';
    import { addNotification } from '$lib/stores/notifications';
    import { sdkForConsole } from '$lib/stores/sdk';
    import { organization, organizationList } from '$lib/stores/organization';
    import { goto, invalidate } from '$app/navigation';
    import { base } from '$app/paths';
    import { Dependencies } from '$lib/constants';
    import { trackEvent } from '$lib/actions/analytics';
    import { Query } from "@aw-labs/appwrite-console";
    import { FormList, InputPassword, InputText } from "$lib/elements/forms/index.js";

    export let showDelete = false;

    let password: string = null;
    let name: string = null;

    const deleteOrg = async () => {
        try {
            await sdkForConsole.teams.delete($organization.$id);

            const projectList = await sdkForConsole.projects.list([
                Query.equal('teamId', $organization.$id),
            ])

            await Promise.all(projectList.projects.map(async (project) => {
                await sdkForConsole.projects.delete(project.$id, password);
            }));

            addNotification({
                type: 'success',
                message: `${$organization.name} has been deleted`
            });
            trackEvent('submit_organization_delete');
            if ($organizationList?.total > 1) {
                await invalidate(Dependencies.ACCOUNT);
                goto(`${base}/console/`);
            } else {
                await invalidate(Dependencies.ACCOUNT);
                goto(`${base}/console/onboarding`);
            }
            showDelete = false;
        } catch (error) {
            addNotification({
                type: 'error',
                message: error.message
            });
        }
    };
</script>

<Modal on:submit={deleteOrg} bind:show={showDelete} warning>
    <svelte:fragment slot="header">Delete Organization</svelte:fragment>
    <p>
        Are you sure you want to delete <b>{$organization.name}</b>? All projects
        and data associated with this organization will be deleted. This action is irreversible.
    </p>

    <FormList>
        <InputText
            label={`Enter "${$organization.name}" to continue`}
            placeholder="Enter name"
            id="name"
            autofocus
            required
            bind:value={name} />
        <InputPassword
            label="To verify, enter your password"
            placeholder="Enter password"
            id="password"
            required
            showPasswordButton={true}
            bind:value={password} />
    </FormList>
    <svelte:fragment slot="footer">
        <Button text on:click={() => (showDelete = false)}>Cancel</Button>
        <Button disabled={!name || !password || name !== $organization.name} secondary submit>
            Delete
        </Button>
    </svelte:fragment>
</Modal>
