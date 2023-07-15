<script lang="ts">
    import { CardGrid, Box, AvatarGroup, Heading } from '$lib/components';
    import { InputText, Form, Button } from '$lib/elements/forms';
    import { Container } from '$lib/layout';
    import { addNotification } from '$lib/stores/notifications';
    import { sdk } from '$lib/stores/sdk';
    import { members, organization } from '$lib/stores/organization';
    import { invalidate } from '$app/navigation';
    import { Dependencies } from '$lib/constants';
    import { onMount } from 'svelte';
    import Delete from '../deleteOrganization.svelte';
    import { Submit, trackEvent, trackError } from '$lib/actions/analytics';
    import LL from '$i18n/i18n-svelte';

    let name: string;
    let showDelete = false;

    onMount(() => {
        name = $organization.name;
    });

    async function updateName() {
        try {
            await sdk.forConsole.teams.updateName($organization.$id, name);
            await invalidate(Dependencies.ORGANIZATION);
            addNotification({
                message: 'Name has been updated',
                type: 'success'
            });
            trackEvent(Submit.OrganizationUpdateName);
        } catch (error) {
            addNotification({
                message: error.message,
                type: 'error'
            });
            trackError(error, Submit.OrganizationUpdateName);
        }
    }

    $: avatars = $members.memberships.map((team) => team.userName);
</script>

<Container>
    {#if $organization}
        <Form onSubmit={updateName}>
            <CardGrid>
                <Heading tag="h6" size="7"
                    >{$LL.console.organization.forms.updateName.title()}</Heading>

                <svelte:fragment slot="aside">
                    <ul>
                        <InputText
                            id="name"
                            label={$LL.console.organization.forms.updateName.inputs.name.label()}
                            placeholder={$LL.console.organization.forms.updateName.inputs.name.placeholder()}
                            autocomplete={false}
                            bind:value={name} />
                    </ul>
                </svelte:fragment>

                <svelte:fragment slot="actions">
                    <Button disabled={name === $organization.name || !name} submit
                        >{$LL.console.organization.button.submit.update()}</Button>
                </svelte:fragment>
            </CardGrid>
        </Form>

        <CardGrid danger>
            <div>
                <Heading tag="h6" size="7"
                    >{$LL.console.organization.forms.deleteOrg.title()}</Heading>
            </div>
            <p>
                {$LL.console.organization.forms.deleteOrg.texts.orgSettings()}
            </p>
            <svelte:fragment slot="aside">
                <Box>
                    <svelte:fragment slot="image">
                        <AvatarGroup {avatars} total={$members.total} />
                    </svelte:fragment>
                    <svelte:fragment slot="title">
                        <h6 class="u-bold u-trim-1">{$organization.name}</h6>
                    </svelte:fragment>
                    <p>{$organization.total}{' '}{$LL.console.organization.texts.members()}</p>
                </Box>
            </svelte:fragment>

            <svelte:fragment slot="actions">
                <Button secondary on:click={() => (showDelete = true)}
                    >{$LL.console.organization.button.submit.delete()}</Button>
            </svelte:fragment>
        </CardGrid>
    {/if}
</Container>

<Delete bind:showDelete />
