import type { Participant } from '@prisma/client';
import { app, prisma } from '../app';
import type { ModalView } from '@slack/types';

const FanpageSubmitConfirm = (participant: Participant, parentViewId: string) => {
    return {
        "type": "modal",
        "title": {
            "type": "plain_text",
            "text": "Submit to Fanpage",
            "emoji": true
        },
        "close": {
            "type": "plain_text",
            "text": "Cancel",
            "emoji": true
        },
        "blocks": [
            {
                "type": "section",
                "text": {
                    "type": "mrkdwn",
                    "text": "Ready to submit your Fanpage project?"
                },
                "accessory": {
                    "type": "button",
                    "text": {
                        "type": "plain_text",
                        "text": "Submit!",
                        "emoji": true
                    },
                    "style": "primary",
                    "url": `https://submit.hackclub.com/fanpage?hackatime_project_name=${encodeURIComponent(participant.hackatimeProject || '')}&git_url=${encodeURIComponent(participant.gitLink || '')}&slack_id=${encodeURIComponent(participant.slackId)}`,
                    "action_id": "fanpage-submitted"
                }
            }
        ]
    } as ModalView;
}

app.action('open-fanpage-submit', async ({ body, ack, client }) => {
    await ack();

    const participant = await prisma.participant.findFirstOrThrow({
        where: {
            slackId: body.user.id,
            ysws: "fanpage"
        }
    });

    await client.views.push({
        //@ts-ignore
        trigger_id: body.trigger_id,        
        //@ts-ignore
        view: FanpageSubmitConfirm(participant, body.view.id)
    });
});

app.view('fanpage-submitted', async ({ body, ack, client }) => {
    await ack({
        response_action: 'clear'
    });

    await prisma.participant.updateMany({
        where: {
            slackId: body.user.id,
            ysws: "fanpage"
        },
        data: {
            submitted: true
        }
    });
});