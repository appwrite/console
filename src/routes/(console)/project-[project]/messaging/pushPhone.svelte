<script lang="ts">
    import { project } from '../store';

    export let title = '';
    export let body = '';
    export let classes = '';
</script>

<div class="phone {classes}">
    <div
        class="u-flex u-flex-vertical card u-margin-inline-start-24 u-margin-inline-end-24 u-gap-8">
        <div class="u-flex u-main-space-between header">
            <div class="u-flex u-gap-4 u-cross-center">
                <span class="u-icon icon-bell u-line-height-1" /><span class=""
                    >{$project.name}</span>
            </div>
            <div class="u-flex u-cross-center">now</div>
        </div>
        <div>
            <p class="body-text-1 u-small u-bold">{title || 'Message Title'}</p>
            <p class="notification-bubble body-text-2 u-x-small">
                {body || 'Enter your message in the input field on the left to see it here'}
            </p>
        </div>
    </div>
</div>

<style lang="scss">
    .phone {
        width: 320px;
        height: 539px;
        background-image: url('./push-notification-preview-light.svg');
        background-repeat: no-repeat;
        padding-top: 197px;
        --p-body-text-color: hsl(var(--color-neutral-120));

        .card {
            position: relative;
            width: 329px;
            --card-padding: 1rem;

            .header {
                --p-body-text-color: hsl(var(--color-neutral-100));

                .icon-bell {
                    --p-body-text-color: hsl(var(--color-neutral-50));
                }
            }
        }
    }

    .notification-bubble {
        overflow: hidden;
        display: -webkit-box;
        line-clamp: 4;
        word-break: break-word;
        -webkit-line-clamp: 4;
        -webkit-box-orient: vertical;
    }

    :global(.theme-dark) .phone {
        background-image: url('./push-notification-preview-dark.svg');

        .card {
            --p-card-bg-color: 240, 3%, 14%, 0.9;

            .header {
                .icon-bell {
                    --p-body-text-color: hsl(var(--color-neutral-150));
                }
            }

            .body-text-1 {
                --p-body-text-color: #e4e4e7;
            }

            .body-text-2 {
                --p-body-text-color: #adadb0;
            }
        }
    }
</style>
