<script lang="ts">
    let show = true;
</script>

{#if show}
    <section class="upload-box is-float">
        <header class="upload-box-header">
            <h4 class="upload-box-title">
                <span class="text">Importing Data</span>
            </h4>
            <button
                class="upload-box-button"
                aria-label="close migration box"
                on:click={() => (show = false)}>
                <span class="icon-x" aria-hidden="true" />
            </button>
        </header>
        <div class="upload-box-content is-open">
            <section class="progress-bar">
                <div class="progress-bar-top-line u-flex u-gap-8 u-main-space-between">
                    <span>60%</span>
                    <span>2 mins left</span>
                </div>
                <div class="progress-bar-container" style="--graph-size:50%" />
                <span>Importing users...</span>
            </section>
        </div>
    </section>
{/if}

<style>
    .upload-box-content {
        padding: 1.5rem;
        min-width: 400px;
        max-width: 100vw;
    }
</style>
