<script lang="ts">
    import { dismissNotification, notifications } from '../stores/notifications';
    import { flip } from 'svelte/animate';
    import { Layout, Toast } from '@appwrite.io/pink-svelte';
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
        position: fixed;
        top: calc(var(--main-header-height) + 12px);
        right: 12px;
        z-index: 1000;
    }

    @media (min-width: 768px) {
        section {
            top: calc(var(--main-header-height) + 24px);
            right: 24px;
        }
    }
</style>
