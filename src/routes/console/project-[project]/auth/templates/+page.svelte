<script lang="ts">
    import { goto } from '$app/navigation';
    import { base } from '$app/paths';
    import Alert from '$lib/components/alert.svelte';
    import Container from '$lib/layout/container.svelte';
    import { project } from '../../store';
</script>

<Container>
    {#if !$project.smtpEnabled}
        <Alert
            dismissible
            info
            buttons={[
                {
                    name: 'Add SMTP server',
                    method: () => {
                        goto(base + '/console/project-' + $project.$id + '/settings/smtp');
                    }
                }
            ]}>
            <svelte:fragment slot="title">
                Custom SMTP server is required for customizing emails
            </svelte:fragment>
            Configure a custom SMTP server to enable custom email templates and prevent emails from being
            labeled as spam.
        </Alert>
    {/if}
</Container>
