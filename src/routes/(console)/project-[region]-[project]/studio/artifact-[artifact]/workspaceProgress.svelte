<script lang="ts">
    import { workspaceState } from '$lib/stores/chat';
    import { IconCheckCircle } from '@appwrite.io/pink-icons-svelte';
    import { Icon, Spinner } from '@appwrite.io/pink-svelte';
</script>

<div class="workspace-progress">
    <div class="progress-steps">
      {#each $workspaceState.steps as step}
        <div class="step">
          <div class="step-status">
            {#if step.status === "in-progress"}
            <Icon icon={Spinner} size="s" />
            {/if}
            {#if step.status === "completed"}
                <Icon icon={IconCheckCircle} size="s" />
            {/if}
          </div>
          <div class="step-text">{step.text}</div>
        </div>
      {/each}
    </div>
</div>

<style lang="scss">
  .workspace-progress {
    height: 100%;
    width: 100%;
    background-color: #000;
    justify-content: center;
    align-items: center;
    display: flex;
  }

  .progress-steps {
    width: 240px;
    background-color: #282828;
    border-radius: 8px;
    color: #fff;
  }

  .step {
    padding: 12px 16px;
    display: flex;
    gap: 12px;
  }

  .step:not(:last-child) {
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  }
  
</style>