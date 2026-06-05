<script lang="ts">
    import { invalidate } from '$app/navigation';
    import { Submit, trackError, trackEvent } from '$lib/actions/analytics';
    import { CardGrid } from '$lib/components';
    import { Dependencies } from '$lib/constants';
    import { Button, Form, InputCheckbox, InputNumber } from '$lib/elements/forms';
    import { addNotification } from '$lib/stores/notifications';
    import { sdk } from '$lib/stores/sdk';
    import { IconInfo } from '@appwrite.io/pink-icons-svelte';
    import { Icon, Layout, Tooltip, Typography } from '@appwrite.io/pink-svelte';
    import type { Models } from '@appwrite.io/console';

    let {
        project,
        policy
    }: {
        project: Models.Project;
        policy: Models.PolicyPasswordStrength;
    } = $props();

    const getInitialMinLength = () => policy.min;
    const getInitialUppercase = () => policy.uppercase;
    const getInitialLowercase = () => policy.lowercase;
    const getInitialNumber = () => policy.number;
    const getInitialSymbols = () => policy.symbols;

    let savedMinLength = $state(getInitialMinLength());
    let savedUppercase = $state(getInitialUppercase());
    let savedLowercase = $state(getInitialLowercase());
    let savedNumber = $state(getInitialNumber());
    let savedSymbols = $state(getInitialSymbols());

    let passwordMinLength = $state(getInitialMinLength());
    let passwordUppercase = $state(getInitialUppercase());
    let passwordLowercase = $state(getInitialLowercase());
    let passwordNumber = $state(getInitialNumber());
    let passwordSymbols = $state(getInitialSymbols());

    const hasChanges = $derived.by(() => {
        return (
            passwordMinLength !== savedMinLength ||
            passwordUppercase !== savedUppercase ||
            passwordLowercase !== savedLowercase ||
            passwordNumber !== savedNumber ||
            passwordSymbols !== savedSymbols
        );
    });

    async function updatePasswordStrengthPolicy() {
        try {
            await sdk.forProject(project.region, project.$id).project.updatePasswordStrengthPolicy({
                min: passwordMinLength,
                uppercase: passwordUppercase,
                lowercase: passwordLowercase,
                number: passwordNumber,
                symbols: passwordSymbols
            });

            savedMinLength = passwordMinLength;
            savedUppercase = passwordUppercase;
            savedLowercase = passwordLowercase;
            savedNumber = passwordNumber;
            savedSymbols = passwordSymbols;

            await invalidate(Dependencies.PROJECT);
            addNotification({
                type: 'success',
                message: 'Updated password strength policy.'
            });
            trackEvent(Submit.AuthPasswordStrengthUpdate);
        } catch (error) {
            addNotification({
                type: 'error',
                message: error.message
            });
            trackError(error, Submit.AuthPasswordStrengthUpdate);
        }
    }
</script>

<Form onSubmit={updatePasswordStrengthPolicy}>
    <CardGrid gap="xxl">
        <svelte:fragment slot="title">Password strength</svelte:fragment>
        Set the minimum requirements users must meet when creating or changing a password.

        <svelte:fragment slot="aside">
            <Layout.Stack gap="m">
                <div class="password-strength-length">
                    <InputNumber
                        required
                        max={256}
                        min={8}
                        label="Minimum length"
                        id="password-strength-min"
                        bind:value={passwordMinLength}>
                        <Tooltip slot="info">
                            <Icon icon={IconInfo} size="s" />
                            <span slot="tooltip">
                                Passwords must be between 8 and 256 characters.
                            </span>
                        </Tooltip>
                    </InputNumber>
                </div>
                <Layout.Stack gap="s">
                    <Typography.Text size="m" weight="medium">
                        Character requirements
                    </Typography.Text>
                    <div class="password-strength-requirements">
                        <InputCheckbox
                            bind:checked={passwordUppercase}
                            id="password-strength-uppercase"
                            label="Uppercase letter" />
                        <InputCheckbox
                            bind:checked={passwordLowercase}
                            id="password-strength-lowercase"
                            label="Lowercase letter" />
                        <InputCheckbox
                            bind:checked={passwordNumber}
                            id="password-strength-number"
                            label="Number" />
                        <InputCheckbox
                            bind:checked={passwordSymbols}
                            id="password-strength-symbols"
                            label="Special character" />
                    </div>
                </Layout.Stack>
            </Layout.Stack>
        </svelte:fragment>

        <svelte:fragment slot="actions">
            <Button disabled={!hasChanges} submit>Update</Button>
        </svelte:fragment>
    </CardGrid>
</Form>

<style lang="scss">
    .password-strength-length {
        max-width: 18rem;
    }

    .password-strength-requirements {
        display: grid;
        gap: var(--space-3) var(--space-7);
        grid-template-columns: minmax(0, 1fr);
    }

    @media (min-width: 769px) {
        .password-strength-requirements {
            grid-template-columns: repeat(2, minmax(0, 1fr));
        }
    }
</style>
