<script lang="ts">
    import { Modal } from '$lib/components';
    import { migrator } from '$lib/stores/migrator';
    import Loading from '$routes/loading.svelte';

    export let show = false;
</script>

<Modal bind:show>
    <svelte:fragment slot="header">Resolve import issues</svelte:fragment>
    <div class="box">
        <div class="u-flex u-cross-center u-gap-16">
            <div class="icon-wrapper">
                {#if $migrator.items.databases === 'error'}
                    <i class="icon-exclamation" />
                {:else if $migrator.items.databases === 'success'}
                    <i class="icon-check" />
                {:else}
                    <span class="loader" />
                {/if}
            </div>

            <div>
                <span>Databases</span>
                <span class="inline-tag">2</span>
            </div>
        </div>

        <div class="u-flex u-cross-center u-gap-16">
            <div class="icon-wrapper">
                {#if $migrator.items.documents === 'error'}
                    <i class="icon-exclamation" />
                {:else if $migrator.items.documents === 'success'}
                    <i class="icon-check" />
                {:else}
                    <span class="loader" />
                {/if}
            </div>
            <div>
                <span>Documents</span>
                <span class="inline-tag">3000</span>
            </div>
        </div>

        <div class="u-flex u-cross-center u-gap-16">
            <div class="icon-wrapper">
                {#if $migrator.items.users === 'error'}
                    <i class="icon-exclamation" />
                {:else if $migrator.items.users === 'success'}
                    <i class="icon-check" />
                {:else}
                    <span class="loader" />
                {/if}
            </div>
            <div>
                <span>Users</span>
                <span class="inline-tag">238</span>
            </div>
        </div>

        <div class="u-flex u-cross-center u-gap-16">
            <div class="icon-wrapper">
                {#if $migrator.items.storage === 'error'}
                    <i class="icon-exclamation" />
                {:else if $migrator.items.storage === 'success'}
                    <i class="icon-check" />
                {:else}
                    <span class="loader" />
                {/if}
            </div>
            <div>
                <span>Storage</span>
                <span class="inline-tag">30GB</span>
            </div>
        </div>
    </div>
</Modal>

<style lang="scss">
    .box {
        padding: 0;

        > div {
            padding: 1.25rem;

            &:not(:last-child) {
                border-bottom: 1px solid hsl(var(--color-border));
            }
        }
    }

    .icon-wrapper {
        display: grid;
        place-items: center;

        width: 1.5rem;
        height: 1.5rem;
    }

    .icon-exclamation {
        color: hsl(var(--color-danger-100));
    }
</style>
