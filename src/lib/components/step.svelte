<script lang="ts">
    export let done = false;
    export let current = false;
</script>

<li
    class="steps-item"
    class:is-done={done}
    class:is-current={current}
    aria-label={` ${done ? 'done' : current ? 'current' : ''} step`}>
    <span class="text"><slot /></span>
</li>
