<script lang="ts">
    import { CardGrid, Heading } from '$lib/components';
    import { Pill } from '$lib/elements/';
    import { Button, InputNumber, InputSelect } from '$lib/elements/forms';
    import { Container } from '$lib/layout';
    import { project } from '../../store';
    import { addNotification } from '$lib/stores/notifications';
    import { sdkForConsole } from '$lib/stores/sdk';
    import { clickOnEnter } from '$lib/helpers/a11y';
    import { invalidate } from '$app/navigation';
    import { Dependencies } from '$lib/constants';
    import { trackEvent } from '$lib/actions/analytics';
    import { timeToMinutes } from '$lib/helpers/timeConversion';

    const projectId = $project.$id;
    let isLimited = $project.authLimit === 0 ? 'unlimited' : 'limited';
    let newLimit = $project.authLimit === 0 ? 100 : $project.authLimit;
    let time: number = $project.authDuration;
    let period = 'm';
    let btnActive = false;

    let options = [
        { label: 'years', value: 'y' },
        { label: 'months', value: 'M' },
        { label: 'days', value: 'd' },
        { label: 'hours', value: 'h' },
        { label: 'minutes', value: 'm' },
        { label: 'seconds', value: 's' }
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
            await sdkForConsole.projects.updateAuthLimit(
                projectId,
                isLimited === 'unlimited' ? 0 : newLimit
            );
            invalidate(Dependencies.PROJECT);
            btnActive = false;
            addNotification({
                type: 'success',
                message: 'Updated project users limit successfully'
            });
            trackEvent('submit_auth_limit_update');
        } catch (error) {
            addNotification({
                type: 'error',
                message: error.message
            });
        }
    }
    async function updateSessionLength() {
        try {
            await sdkForConsole.projects.updateAuthDuration(projectId, timeToMinutes(time, period));
            invalidate(Dependencies.PROJECT);

            addNotification({
                type: 'success',
                message: 'Updated project users limit successfully'
            });
            trackEvent('submit_session_length_update');
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
        <Heading tag="h2" size="6">Users Limit</Heading>
        <p>
            Limit new users from signing up for your project, regardless of authentication method.
            You can still create users and team memberships from your Appwrite console.
            <b> The maximum limit is 10,000 users.</b>
        </p>

        <svelte:fragment slot="aside">
            <ul class="form-list">
                <li class="form-item">
                    <label class="choice-item" for="unlimited">
                        <input
                            id="unlimited"
                            name="authLimit"
                            class=" u-cross-child-center"
                            required
                            type="radio"
                            checked={isLimited === 'unlimited'}
                            bind:group={isLimited}
                            value="unlimited" />
                        <div class="choice-item-content  u-cross-child-center">
                            <div class="choice-item-title">Unlimited</div>
                        </div>
                        <Pill>recommended</Pill>
                    </label>
                </li>
                <li class="form-item is-multiple">
                    <div class="input-text-wrapper">
                        <label class="choice-item" for="limited">
                            <input
                                id="limited"
                                name="authLimit"
                                required
                                type="radio"
                                checked={isLimited === 'limited'}
                                bind:group={isLimited}
                                value="limited" />
                            <div class="choice-item-content">
                                <div class="choice-item-title">Limited</div>
                            </div>
                        </label>
                    </div>
                    <div
                        class="input-text-wrapper u-stretch"
                        on:click={() => (isLimited = 'limited')}
                        on:keyup|self={clickOnEnter}>
                        <input
                            type="number"
                            name="limit"
                            id="limit"
                            class="input-text"
                            max="10000"
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
        <Heading tag="h2" size="6">Session Length</Heading>
        <p>
            If you reduce the limit, users who are currently logged in will be logged out of the
            application.
        </p>
        <svelte:fragment slot="aside">
            <form class="form u-grid u-gap-16">
                <ul class="form-list is-multiple">
                    <InputNumber disabled id="length" label="Length" bind:value={time} />
                    <InputSelect
                        disabled
                        id="period"
                        label="Time Period"
                        value={period}
                        {options} />
                </ul>
            </form>
        </svelte:fragment>

        <svelte:fragment slot="actions">
            <Button
                disabled={true}
                on:click={() => {
                    updateSessionLength();
                }}>
                Update
            </Button>
        </svelte:fragment>
    </CardGrid>
</Container>
