<script lang="ts">
    import { CardGrid } from '$lib/components';
    import { Pill } from '$lib/elements/';
    import { Button, InputNumber, InputSelect } from '$lib/elements/forms';
    import { Container } from '$lib/layout';
    import { project } from '../store';
    import { addNotification } from '$lib/stores/notifications';
    import { sdkForConsole } from '$lib/stores/sdk';

    const projectId = $project.$id;
    let isLimited = $project.authLimit === 0 ? 'unlimited' : 'limited';
    let newLimit = $project.authLimit === 0 ? 100 : $project.authLimit;
    let btnActive = false;

    let options = [
        { label: 'years', value: 'years' },
        { label: 'months', value: 'months' },
        { label: 'days', value: 'days' }
    ];

    $: {
        if (isLimited) {
            if (isLimited === 'unlimited' && $project.authLimit === 0) {
                btnActive = false;
            } else if (isLimited === 'limited' && $project.authLimit === newLimit) {
                btnActive = false;
            } else {
                btnActive = true;
            }
        }
    }

    async function updateLimit() {
        try {
            project.set(
                await sdkForConsole.projects.updateAuthLimit(
                    projectId,
                    isLimited === 'unlimited' ? 0 : newLimit
                )
            );
            btnActive = false;

            addNotification({
                type: 'success',
                message: 'Updated project users limit successfully'
            });
        } catch (error) {
            addNotification({
                type: 'error',
                message: error.message
            });
        }
    }
    async function updateSessionLength() {
        try {
            //TODO: implement correct SDK call

            addNotification({
                type: 'success',
                message: 'Updated project users limit successfully'
            });
        } catch (error) {
            addNotification({
                type: 'error',
                message: error.message
            });
        }
    }
</script>

<Container>
    <CardGrid>
        <h2 class="heading-level-6">Users Limit</h2>
        <p>
            This limits new users from signing up for your project, regardless of authentication
            method. You can still create users from your Appwrite console.
        </p>

        <svelte:fragment slot="aside">
            <ul class="form-list">
                <li class="form-item">
                    <div class="input-text-wrapper">
                        <input
                            id="unlimited"
                            name="authLimit"
                            required
                            type="radio"
                            checked={isLimited === 'unlimited'}
                            bind:group={isLimited}
                            value="unlimited" />
                        <label class="label" for="unlimited"
                            >Unlimited <Pill>recommended</Pill></label>
                    </div>
                </li>
                <li class="form-item is-multiple">
                    <div class="input-text-wrapper">
                        <input
                            id="limited"
                            name="authLimit"
                            required
                            type="radio"
                            checked={isLimited === 'limited'}
                            bind:group={isLimited}
                            value="limited" />
                        <label class="label" for="limited">Limited</label>
                    </div>
                    <div
                        class="input-text-wrapper u-stretch"
                        on:click={() => (isLimited = 'limited')}>
                        <input
                            type="number"
                            name="limit"
                            id="limit"
                            class="input-text"
                            disabled={isLimited === 'unlimited'}
                            bind:value={newLimit} />
                    </div>
                </li>
            </ul>
        </svelte:fragment>

        <svelte:fragment slot="actions">
            <Button
                disabled={!btnActive}
                on:click={() => {
                    updateLimit();
                }}>Update</Button>
        </svelte:fragment>
    </CardGrid>

    <CardGrid>
        <h2 class="heading-level-6">Session Length</h2>
        <p>
            If you reduce the limit, users who are currently logged in will be logged out of the
            application.
        </p>
        <svelte:fragment slot="aside">
            <form class="form u-grid u-gap-16">
                <ul class="form-list is-multiple">
                    <InputNumber id="length" label="Length" value={1} />
                    <InputSelect
                        id="period"
                        {options}
                        label="Time Period"
                        value={options[0].value} />
                </ul>
            </form>
        </svelte:fragment>

        <svelte:fragment slot="actions">
            <Button
                disabled={true}
                on:click={() => {
                    updateSessionLength();
                }}>Update</Button>
        </svelte:fragment>
    </CardGrid>
</Container>
