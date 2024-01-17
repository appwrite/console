<script lang="ts">
    import { Button } from '$lib/elements/forms';
    import { Modal } from '$lib/components';
    import { FormList } from '$lib/elements/forms';
    import InputTags from '$lib/elements/forms/inputTags.svelte';
    import InputCheckbox from '$lib/elements/forms/inputCheckbox.svelte';
    import { user } from '$lib/stores/user';
    import { addNotification } from '$lib/stores/notifications';
    import { Submit, trackError, trackEvent } from '$lib/actions/analytics';
    import { sdk } from '$lib/stores/sdk';
    import { project } from '../../store';

    export let showModal = false;
    export let senderName: string;
    export let senderEmail: string;
    export let replyTo: string;
    export let host: string;
    export let port: number;
    export let username: string;
    export let password: string;
    export let secure;

    let error: string = null;
    let sendToSelf = true;
    let sendToOthers = false;
    let emails = [];

    function close() {
        showModal = false;
    }

    async function handleTestEmail() {
        try {
            const allMails = [ ...emails ];
            if(sendToSelf) {
                allMails.push($user.email);
            }

            await sdk.forConsole.projects.createSmtpTest(
                $project.$id,
                allMails,
                senderName ? senderName : undefined,
                senderEmail ? senderEmail : undefined,
                host ? host : undefined,
                replyTo ? replyTo : undefined,
                port ? port : undefined,
                username ? username :  undefined,
                password ? password : undefined,
                secure ? 'tls' : undefined
            )
        close();
        if(allMails.length === 1) {
            addNotification({
                type: 'success',
                message: `Test email has been sent to ${allMails[0]}`
            });
        } else {
            addNotification({
                type: 'success',
                message: `Test email has been sent to ${allMails[0]} and ${allMails.length - 1} others`
            });

        }
            trackEvent(Submit.ProjectTestSMTP);
        } catch (e) {
            error = e.message;
            trackError(e, Submit.ProjectTestSMTP);
        }
        
    }
</script>

<Modal bind:error bind:show={showModal} onSubmit={handleTestEmail}>
    <svelte:fragment slot="title">
       Send test email
    </svelte:fragment>
    <div class="u-margin-block-start-16">
        <FormList gap={24}>
            <div class="u-flex u-cross-center u-gap-8">
    
          
            <InputCheckbox
            id="send-to-self"
            checked={sendToSelf}
            on:click={() => sendToSelf = !sendToSelf} />
            <p class="text u-bold">{$user.email}</p>
        </div>
    
        <div class="u-flex u-cross-start u-gap-8">
            <InputCheckbox
            id="send-to-others"
            wrapperTag="div"
            checked={sendToOthers}
            on:click={() => sendToOthers = !sendToOthers} />
           
            <div>
                <p class="text u-bold">Others</p>
                <p class="text u-margin-block-start-8">Enter the email address(es) to which the test message will be sent</p>
                <div class="u-margin-block-start-8" style="border: solid 0.0625rem hsl(var(--color-border)); border-radius: var(--border-radius-small);">
                    <InputTags
                    disabled={!sendToOthers}
                    id="others-emails"
                    label="Email address(es)"
                    showLabel={false}
                    placeholder="Enter email address(es)"
                    bind:tags={emails} />
                </div>
                
            </div>
    
            </div>
        </FormList>
    </div>

    <svelte:fragment slot="footer">
        <Button secondary on:click={close}>Cancel</Button>
        <Button submit>Send</Button>
    </svelte:fragment>
</Modal>
