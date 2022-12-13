<script lang="ts">
    import { CardGrid, Heading } from '$lib/components';
    import { Pill } from '$lib/elements/';
    import { Button, InputNumber, InputSelect, Form } from '$lib/elements/forms';
    import { Container } from '$lib/layout';
    import { project } from '../../store';
    import { addNotification } from '$lib/stores/notifications';
    import { sdkForConsole } from '$lib/stores/sdk';
    import { clickOnEnter } from '$lib/helpers/a11y';
    import { invalidate } from '$app/navigation';
    import { Dependencies } from '$lib/constants';
    import { trackEvent } from '$lib/actions/analytics';
    import { timeToSeconds } from '$lib/helpers/timeConversion';
    import { writable } from 'svelte/store';

    const projectId = $project.$id;
    let isLimited = $project.authLimit === 0 ? 'unlimited' : 'limited';
    let newLimit = $project.authLimit === 0 ? 100 : $project.authLimit;
    let time = $project.authDuration;
    let timeInSec = time;
    let period = writable('s');
    let btnActive = false;
    let maxSessions = $project.authMaxSessions ?? 10;

    let options = [
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
            await sdkForConsole.projects.updateAuthDuration(
                projectId,
                timeToSeconds(time, $period)
            );
            invalidate(Dependencies.PROJECT);
            $period = 's';

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
    async function updateSessionsLimit() {
        try {

            const path = '/projects/' + projectId + '/auth/max-sessions';
            const uri = new URL(sdkForConsole.client.config.endpoint + path);
            await sdkForConsole.client.call('patch', uri, {
                'content-type': 'application/json',
            }, {
                limit: maxSessions
            });
            addNotification({
                type: 'success',
                message: 'Sessions limit has been updated'
            });
            trackEvent('submit_sessions_limit_update');
        } catch (error) {
            addNotification({
                type: 'error',
                message: error.message
            });
        }
    }

    period.subscribe((p) => {
        if (p === 'd') {
            time = timeInSec / 86400;
            timeInSec = timeToSeconds(time, p);
        } else if (p === 'h') {
            time = timeInSec / 3600;
            timeInSec = timeToSeconds(time, p);
        } else if (p === 'm') {
            time = timeInSec / 60;
            timeInSec = timeToSeconds(time, p);
        } else if (p === 's') {
            time = timeInSec;
            timeInSec = timeToSeconds(time, p);
        }
    });

    $: if (time) {
        timeInSec = timeToSeconds(time, $period);
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
                    <InputNumber id="length" label="Length" bind:value={time} />
                    <InputSelect id="period" label="Time Period" bind:value={$period} {options} />
                </ul>
            </form>
        </svelte:fragment>

        <svelte:fragment slot="actions">
            <Button
                disabled={$period === 's' && time === $project.authDuration}
                on:click={() => {
                    updateSessionLength();
                }}>
                Update
            </Button>
        </svelte:fragment>
    </CardGrid>

    <Form on:submit={updateSessionsLimit}>
        <CardGrid>
            <Heading tag="h2" size="6">Session Limit</Heading>
            <p>
                Maximum number of active sessions allowed per user.
            </p>
            <svelte:fragment slot="aside">
                    <ul>
                        <InputNumber id="max-session" label="Limit" bind:value={maxSessions} />
                    </ul>
            </svelte:fragment>
    
            <svelte:fragment slot="actions">
                <Button disabled={maxSessions === $project.authMaxSessions} submit>Update</Button>
            </svelte:fragment>
        </CardGrid>
    </Form>
</Container>
