/** @jsxImportSource jsx-slack */
import JSXSlack, { Blocks, Button, Image, Input, Modal, Option, Section, Select } from 'jsx-slack';
import { app, prisma } from '../app';
import type { Participant } from '@prisma/client';
import { FanpageSubmit } from './fanpage';

const JournalInput = (parentViewId: string, journalLink: string | null) => (
    <Modal title='Link Journal' close='Close' callbackId='journal-link' privateMetadata={parentViewId}>
        <Input label='Journal URL' title='Please enter your GitHub/Git repo link' value={journalLink || ''} blockId='journal_url' actionId='journal_url' required />
    </Modal>
)

app.action('open-journal-link', async ({ body, ack, client }) => {
    await ack();

    console.log('recieved journal link action');

    const alreadyLinked = await prisma.participant.findFirst({
        where: {
            slackId: body.user.id,
            ysws: "fanpage"
        }
    }).then(p => p?.journalLink);

    await client.views.push({
        //@ts-ignore
        trigger_id: body.trigger_id,
        //@ts-ignore
        view: JSXSlack(JournalInput(body.view.id, alreadyLinked))
    });
});

app.view('journal-link', async ({ body, ack, client }) => {
    await ack();
    
    console.log('recieved journal link submission');

    //@ts-ignore
    const journalLink = body.view.state.values.journal_url.journal_url?.value;

    await prisma.participant.updateMany({
        where: {
            slackId: body.user.id,
            ysws: "fanpage"
        },
        data: {
            journalLink: journalLink
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