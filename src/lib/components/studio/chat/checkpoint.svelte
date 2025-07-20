<script lang="ts">
    import type { ImagineUIDataParts } from '$shared-types';

    let { checkpointPart }: { checkpointPart: ImagineUIDataParts['checkpoint'] } = $props();
</script>

<div class="checkpoint-container">
    <div class="header">
      <div class="version-text">
        Checkpoint <span class="sha">{checkpointPart.commitSha}</span>
      </div>
      <div class="is-latest">
          {new Date(checkpointPart.timestamp).toLocaleString('en-US', {
              dateStyle: 'medium',
              timeStyle: 'short'
          })}
      </div>
    </div>
    <div class="content">
      {checkpointPart.commitMessage}
    </div>
</div>

<style lang="scss">
.checkpoint-container {
        position: relative;
        margin-top: 0.4rem;
        margin-bottom: 0.4rem;
        font-size: 0.75rem;
        background: var(--bgcolor-neutral-primary);
        border: 1px solid var(--border-neutral);
        border-top: 0;
        border-radius: 8px;
        overflow: hidden;
        transition: all 0.3s ease;
        box-shadow: 0 1px 3px var(--overlay-neutral-hover);
    }

    .header {
        background: var(--bgcolor-neutral-secondary);
        border: 1px solid var(--border-neutral);
        border-radius: 0.125rem 0.125rem 0 0;
        border-left: 0;
        border-right: 0;
        color: var(--fgcolor-neutral-secondary);
        height: 2rem;
        display: flex;
        align-items: center;
        padding: 0.5rem 0.75rem;
        justify-content: space-between;
    }

    .sha {
      font-weight: 600;
    }

    .content {
        padding: 0.5rem;
        overflow: hidden;
    }
</style>