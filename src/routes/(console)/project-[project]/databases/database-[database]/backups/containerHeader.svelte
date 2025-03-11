<script lang="ts">
    import { Pill } from '$lib/elements';
    import { DropList } from '$lib/components';
    import { wizard } from '$lib/stores/wizard';
    import { Button } from '$lib/elements/forms';
    import SupportWizard from '$routes/(console)/supportWizard.svelte';
    import { IconInfo, IconPlus } from '@appwrite.io/pink-icons-svelte';
    import { Badge, Icon, Layout, Typography } from '@appwrite.io/pink-svelte';

    export let isFlex = true;
    export let title: string;

    export let buttonText: string = null;
    export let policiesCreated: number = 0;
    export let maxPolicies: number = 0;
    export let buttonMethod: () => void = null;
    export let buttonEvent: string = buttonText?.toLocaleLowerCase();
    export let buttonDisabled = false;
    export let buttonType: 'primary' | 'secondary' | 'text' = 'primary';

    let showDropdown = false;
</script>

<header
    class:is-disabled={buttonDisabled}
    class:u-flex={isFlex}
    class="u-gap-12 common-section u-main-space-between u-flex-wrap">
    <Layout.Stack
        direction="row"
        gap="m"
        alignContent="center"
        alignItems="center"
        justifyContent="space-between">
        <Layout.Stack direction="row" gap="xs">
            <Typography.Text variant="m-500">{title}</Typography.Text>
            {#if title === 'Policies'}
                <Badge size="xs" variant="secondary" content={policiesCreated.toString()} />
            {/if}
        </Layout.Stack>

        {#if title === 'Policies' && policiesCreated >= maxPolicies}
            <div style:height="40px;" style:padding-block-start="4px">
                <DropList bind:show={showDropdown} width="16">
                    <Pill disabled={buttonDisabled} button on:click={() => (showDropdown = true)}>
                        <Layout.Stack direction="row" gap="xs" alignItems="center" inline>
                            <Icon icon={IconInfo} size="s" />
                            {policiesCreated}/{maxPolicies} created
                        </Layout.Stack>
                    </Pill>
                    <svelte:fragment slot="list">
                        <slot name="tooltip">
                            <span>
                                You are limited to {maxPolicies} policy on your plan.
                                <button
                                    class="u-underline"
                                    on:click={() => {
                                        showDropdown = !showDropdown;
                                        wizard.start(SupportWizard);
                                    }}>Contact support</button> to upgrade your plan and add customized
                                backup policies.
                            </span>
                        </slot>
                    </svelte:fragment>
                </DropList>
            </div>
        {/if}

        {#if title === 'Backups' || policiesCreated < maxPolicies}
            <Button
                event={buttonEvent}
                on:click={buttonMethod}
                disabled={buttonDisabled}
                text={buttonType === 'text'}
                secondary={buttonType === 'secondary'}>
                <Icon icon={IconPlus} slot="start" size="s" />
                {buttonText}
            </Button>
        {/if}
    </Layout.Stack>
</header>

<style>
    .is-disabled {
        opacity: 0.5;
    }
</style>
