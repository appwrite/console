<script lang="ts">
    import { flip } from 'svelte/animate';
    import { Layout, Toast } from '@appwrite.io/pink-svelte';
    import { dismissNotification, notifications } from '../stores/notifications';
</script>

{#if $notifications}
    <section>
        <Layout.Stack gap="s">
            {#each $notifications as notification (notification.id)}
                <span animate:flip={{ duration: 500 }}>
                    <Toast
                        title={notification.title}
                        status={notification.type}
                        description={notification.message}
                        actions={notification.buttons?.map((button) => {
                            return {
                                label: button.name,
                                onClick: button.method
                            };
                        })}
                        on:dismiss={() => dismissNotification(notification.id)} />
                </span>
            {/each}
        </Layout.Stack>
    </section>
{/if}

<style lang="scss">
    section {
        right: 3.25px;
        z-index: 1001;
        position: fixed;
        top: calc(var(--main-header-height) + 12px);
    }

    @media (min-width: 768px) {
        section {
            right: 24px;
            top: calc(var(--main-header-height) + 24px);
        }
    }
</style>
