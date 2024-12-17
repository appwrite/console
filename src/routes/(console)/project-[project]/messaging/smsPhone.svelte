<script lang="ts">
    import { project } from '../store';

    export let content = '';
    export let classes = '';

    function getInitials(name: string) {
        let words = name.split(' ');
        // If there is only one word, split it by underscore
        if (words.length === 1) {
            words = words[0].split('_');
        }

        // Get 1st 2 initials, skipping words that don't start with a letter
        return words
            .filter((word) => word.match(/^[a-z]/i))
            .map((word) => word[0].toUpperCase())
            .slice(0, 2)
            .join('');
    }

    // Current time as H:MM AM/PM
    function getTime() {
        const now = new Date();
        return now.toLocaleTimeString(undefined, {
            hour: 'numeric',
            minute: 'numeric',
            hour12: true
        });
    }
</script>

<div class="phone {classes}">
    <div class="avatar-initials u-text-center u-width-full-line u-line-height-1-5 u-medium u-bold">
        {getInitials($project.name)}
    </div>
    <div class="project-name u-text-center u-x-small u-width-full-line">{$project.name}</div>
    <div class="chat u-text-center u-width-full-line">
        <div class="time u-text-center u-width-full-line u-line-height-0-7">
            Today {getTime()}
        </div>
        <div class="chat-bubble-container">
            <div class="chat-bubble u-text-start">
                {content || 'Enter your message in the input field on the left to see it here'}
            </div>
        </div>
    </div>
</div>

<style lang="scss">
    .phone {
        position: relative;
        width: 320px;
        height: 410px;
        background-image: url('./sms-preview-light.svg');
        background-repeat: no-repeat;

        .avatar-initials {
            position: absolute;
            top: 75px;
            height: 24px;
            color: white;
        }

        .project-name {
            position: absolute;
            top: 116px;
            color: black;
        }

        .chat {
            position: absolute;
            top: 151px;

            .time {
                color: #909093;
                font-weight: 500;
            }

            .chat-bubble-container {
                background-image: url('./bubble-tail-light.svg');
                background-position: bottom 0px left 2px;
                background-repeat: no-repeat;
                margin-inline-start: 7px;
                margin-block-start: 8px;

                .chat-bubble {
                    color: black;
                    background-color: #e9e9eb;
                    border-radius: 20px;
                    padding-inline: 12px;
                    padding-block: 7px;
                    margin-inline-start: 6px;
                    margin-inline-end: 33px;
                }
            }
        }
    }

    :global(.theme-dark) .phone {
        background-image: url('./sms-preview-dark.svg');

        .avatar-initials {
            color: hsl(var(--color-neutral-150));
        }

        .project-name {
            color: white;
        }

        .chat {
            .chat-bubble-container {
                background-image: url('./bubble-tail-dark.svg');

                .chat-bubble {
                    color: #e0e0e0;
                    background-color: #333333;
                }
            }
        }
    }
</style>
