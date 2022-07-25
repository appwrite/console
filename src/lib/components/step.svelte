<script lang="ts">
    export let completed = false;
    export let current = false;
</script>

<li
    class="steps-item"
    class:is-done={completed}
    class:is-current={current}
    aria-label={` ${completed ? 'done' : current ? 'current' : ''} step`}>
    <span class="text"><slot /></span>
</li>
