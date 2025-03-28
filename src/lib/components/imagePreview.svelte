<script lang="ts">
    import { app } from '$lib/stores/app';

    export let darkSrc: string;
    export let lightSrc: string;
    export let alt: string;
</script>

<a
    href={$app.themeInUse === 'dark' ? darkSrc : lightSrc}
    class="file-preview is-with-image"
    style="inline-size: 100%; block-size: 100%;"
    target="_blank"
    rel="noopener noreferrer"
    aria-label="open file in new window">
    <div class="file-preview-image">
        <img src={$app.themeInUse === 'dark' ? darkSrc : lightSrc} {alt} />
    </div>
    <div class="file-preview-content">
        <div class="avatar">
            <span class="icon-external-link" aria-hidden="true"></span>
        </div>
    </div>
</a>
