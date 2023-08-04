<script lang="ts">
    import Notification from './notification.svelte';
    import { dismissNotification, notifications } from '../stores/notifications';
</script>

{#if $notifications}
    <section>
        <ul class="u-flex u-flex-vertical u-gap-16">
            {#each $notifications as notification (notification.id)}
                <Notification
                    type={notification.type}
                    title={notification.title}
                    on:dismiss={() => dismissNotification(notification.id)}
                    buttons={notification?.buttons}>
                    {notification.message}
                </Notification>
            {/each}
        </ul>
    </section>
{/if}

<style lang="scss">
    section {
        position: fixed;
        top: calc(var(--main-header-height) + 24px);
        right: 24px;
        z-index: 1000;
    }

    @media (max-width: 512px) {
        section {
            top: calc(var(--main-header-height) + 16px);
            right: 16px;
            left: 16px;
        }
    }
</style>
