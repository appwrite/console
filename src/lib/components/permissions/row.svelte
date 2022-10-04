<script lang="ts">
    export let role: string;
</script>

<div class="u-flex u-cross-center u-gap-8">
    <div>
        {#if role === 'users'}
            <div>Users</div>
        {:else if role === 'guests'}
            <div>Guests</div>
        {:else if role === 'any'}
            <div>Any</div>
        {:else}
            <div>{role}</div>
        {/if}
    </div>
</div>
