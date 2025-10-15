/** @jsxImportSource jsx-slack */
import JSXSlack, { Actions, Blocks, Header, Image, Modal, Mrkdwn, Section } from 'jsx-slack';
import { app, prisma } from '../app';
import { FanpageSubmit } from './fanpage';

const FanpageIntegrity = (parentViewId: string) => (
    <Modal title='Fanpage Submit' close='Close' submit='Agree' callbackId='fanpage-integrity' privateMetadata={parentViewId}>
        <Header>Hackatime Integrity Agreement</Header>
        <Section>
            <p><strong>TL;DR</strong></p>
        </Section>
        <Section>
            <Mrkdwn>
                &gt; Don’t cheat the time tracking system. No bots, no fake key presses, no UI manipulation. If you do, you’ll be banned from Hackatime and other participating YSWS / events / programs\n
            </Mrkdwn>
        </Section>
        <Section>
            <p>By participating in fanpage, you agree to these terms.</p>
        </Section>
    </Modal>
)

app.action('open-integrity', async ({ body, ack, client }) => {
    await ack();

    await client.views.push({
        //@ts-ignore
        trigger_id: body.trigger_id,
        //@ts-ignore
        view: JSXSlack(FanpageIntegrity(body.view.id))
    });
});

app.view('fanpage-integrity', async ({ body, ack, client }) => { 
    await ack();

    await prisma.participant.updateMany({
        where: {
            slackId: body.user.id,
            ysws: "fanpage"
        },
        data: {
            acceptedIntegrity: true
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