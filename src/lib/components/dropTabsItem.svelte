<script lang="ts">
    export let disabled = false;
</script>

<li class="drop-tabs-item">
    <button class="drop-tabs-button" {disabled} on:click>
        <span class="text"><slot /></span>
    </button>
</li>
