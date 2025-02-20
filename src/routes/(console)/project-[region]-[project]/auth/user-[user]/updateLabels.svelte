<script lang="ts">
    import { onMount } from 'svelte';
    import { invalidate } from '$app/navigation';
    import { Submit, trackEvent, trackError } from '$lib/actions/analytics';
    import { CardGrid, Heading } from '$lib/components';
    import { Dependencies } from '$lib/constants';
    import { Button, Form, Helper, InputTags } from '$lib/elements/forms';
    import { symmetricDifference } from '$lib/helpers/array';
    import { addNotification } from '$lib/stores/notifications';
    import { sdk } from '$lib/stores/sdk';
    import { user } from './store';
    import { Pill } from '$lib/elements';
    import { page } from '$app/stores';

    const alphaNumericRegExp = /^[a-zA-Z0-9]+$/;
    let suggestedLabels = ['admin', 'premium', 'mvp'];
    let labels: string[] = [];
    let error = '';

    onMount(async () => {
        labels = [...$user.labels];
    });

    async function updateLabels() {
        try {
            await sdk
                .forProject($page.params.region, $page.params.project)
                .users.updateLabels($user.$id, labels);
            await invalidate(Dependencies.USER);
            isDisabled = true;

            addNotification({
                message: 'User labels have been updated',
                type: 'success'
            });
            trackEvent(Submit.UserUpdateLabels);
        } catch (error) {
            addNotification({
                message: error.message,
                type: 'error'
            });
            trackError(error, Submit.UserUpdateLabels);
        }
    }

    // TODO: Remove type cast when console SDK is updated
    $: isDisabled =
        !!error ||
        !symmetricDifference(labels, ($user as unknown as { labels: string[] }).labels).length;
    $: if (labels) {
        const invalidLabels = [];

        labels.forEach((label) => {
            if (!alphaNumericRegExp.test(label)) {
                invalidLabels.push(label);
            }
        });

        if (invalidLabels.length) {
            error = `Invalid labels: ${invalidLabels.join(', ')}`;
        } else {
            error = '';
        }
    }
</script>

<Form onSubmit={updateLabels}>
    <CardGrid>
        <Heading tag="h6" size="7">Labels</Heading>
        <p class="text">
            Categorize and manage your users based on specific criteria by assigning them
            customizable labels. New label-based roles will be assigned.
        </p>
        <svelte:fragment slot="aside">
            <ul class="common-section">
                <InputTags
                    id="user-labels"
                    label="Labels"
                    placeholder="Select or type user labels"
                    bind:tags={labels} />
                <li class="u-flex u-gap-12 u-margin-block-start-8">
                    {#each suggestedLabels as suggestedLabel}
                        <Pill
                            selected={labels.includes(suggestedLabel)}
                            button
                            on:click={() => {
                                if (!labels.includes(suggestedLabel)) {
                                    labels = [...labels, suggestedLabel];
                                } else {
                                    labels = labels.filter((e) => e !== suggestedLabel);
                                }
                            }}>
                            <span class="icon-plus" aria-hidden="true" />
                            {suggestedLabel}
                        </Pill>
                    {/each}
                </li>
                <li>
                    <Helper type={error ? 'warning' : 'neutral'}
                        >{error ? error : 'Only alphanumeric characters are allowed'}</Helper>
                </li>
            </ul>
        </svelte:fragment>

        <svelte:fragment slot="actions">
            <Button disabled={isDisabled} submit>Update</Button>
        </svelte:fragment>
    </CardGrid>
</Form>
