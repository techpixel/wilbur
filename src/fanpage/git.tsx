/** @jsxImportSource jsx-slack */
import JSXSlack, { Blocks, Button, Image, Input, Modal, Option, Section, Select } from 'jsx-slack';
import { app, prisma } from '../app';
import type { Participant } from '@prisma/client';
import { FanpageSubmit } from './fanpage';

const GitInput = (parentViewId: string, gitLink: string | null) => (
    <Modal title='Link Git Repo' close='Close' callbackId='github-link' privateMetadata={parentViewId}>
        <Input label='Git/Github URL' title='Please enter your GitHub/Git repo link' value={gitLink || ''} blockId='git_url' actionId='git_url' required />
    </Modal>
)

app.action('open-git-link', async ({ body, ack, client }) => {
    await ack();

    console.log('recieved hackatime link action');

    const alreadyLinked = await prisma.participant.findFirst({
        where: {
            slackId: body.user.id,
            ysws: "fanpage"
        }
    }).then(p => p?.gitLink);

    await client.views.push({
        //@ts-ignore
        trigger_id: body.trigger_id,
        //@ts-ignore
        view: JSXSlack(GitInput(body.view.id, alreadyLinked))
    });
});

app.view('github-link', async ({ body, ack, client }) => {
    await ack();
    
    console.log('recieved hackatime link submission');

    //@ts-ignore
    const gitLink = body.view.state.values.git_url.git_url?.value;

    await prisma.participant.updateMany({
        where: {
            slackId: body.user.id,
            ysws: "fanpage"
        },
        data: {
            gitLink: gitLink
        }
    });

    const participant = await prisma.participant.findFirstOrThrow({
        where: {
            slackId: body.user.id,
            ysws: "fanpage"
        }
    });

    await client.views.update({
        view_id: body.view.private_metadata,
        view: JSXSlack(FanpageSubmit(participant))
    });
});