<script lang="ts">
    import { invalidate } from '$app/navigation';
    import { page } from '$app/stores';
    import { Submit, trackError, trackEvent } from '$lib/actions/analytics';
    import { CardGrid, Heading } from '$lib/components';
    import { Dependencies } from '$lib/constants';
    import { Button, Form, InputText } from '$lib/elements/forms';
    import { addNotification } from '$lib/stores/notifications';
    import { sdk } from '$lib/stores/sdk';
    import { onMount } from 'svelte';
    import { team } from './store';
    import LL from '$i18n/i18n-svelte';

    let teamName: string = null;

    onMount(async () => {
        teamName ??= $team.name;
    });

    async function updateName() {
        try {
            await sdk.forProject.teams.updateName($page.params.team, teamName);
            await invalidate(Dependencies.TEAM);
            addNotification({
                message: 'Name has been updated',
                type: 'success'
            });
            trackEvent(Submit.TeamUpdateName);
        } catch (error) {
            addNotification({
                message: error.message,
                type: 'error'
            });
            trackError(error, Submit.TeamUpdateName);
        }
    }
</script>

<Form onSubmit={updateName}>
    <CardGrid>
        <Heading tag="h6" size="7">{$LL.console.project.forms.teams.updateName.title()}</Heading>

        <svelte:fragment slot="aside">
            <ul>
                <InputText
                    id="name"
                    label={$LL.console.project.forms.teams.updateName.inputs.name.label()}
                    placeholder={$LL.console.project.forms.teams.updateName.inputs.name.placeholder()}
                    autocomplete={false}
                    bind:value={teamName} />
            </ul>
        </svelte:fragment>

        <svelte:fragment slot="actions">
            <Button submit disabled={teamName === $team.name || !teamName}
                >{$LL.console.project.button.submit.update()}</Button>
        </svelte:fragment>
    </CardGrid>
</Form>
