<script lang="ts">
    import Notification from './notification.svelte';
    import { dismissNotification, notifications } from '../stores/notifications';
    import { flip } from 'svelte/animate';
</script>

{#if $notifications}
    <section>
        <ul class="u-flex u-flex-vertical u-gap-16">
            {#each $notifications as notification (notification.id)}
                <li animate:flip={{ duration: 500 }}>
                    <Notification
                        type={notification.type}
                        title={notification.title}
                        icon={notification.icon}
                        on:dismiss={() => dismissNotification(notification.id)}
                        buttons={notification?.buttons}>
                        {notification.message}
                    </Notification>
                </li>
            {/each}
        </ul>
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
