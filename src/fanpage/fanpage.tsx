/** @jsxImportSource jsx-slack */
import JSXSlack, { Blocks, Button, Image, Modal, Section } from 'jsx-slack';
import { app, prisma } from '../app';
import type { Participant } from '@prisma/client';

function Step(step: { description: string, completed: boolean, actionId: string, buttonText: string }) {
    return (
        <Section>
            <p>{step.completed ? ':star:' : ':empty_star:'} {step.description}</p>
            {step.completed ? null : <button actionId={step.actionId} style='primary'>{step.buttonText}</button>}
        </Section>
    );
}

function EditableStep(step: { 
    description: string, 
    completed: boolean, 
    actionId: string, 
    buttonText: string, 
    editButtonText: string }) {
    return (
        <Section>
            <p>{step.completed ? ':star:' : ':empty_star:'} {step.description}</p>
            <button actionId={step.actionId} style={step.completed ? undefined : 'primary'}>{step.completed ? step.editButtonText : step.buttonText}</button>
        </Section>
    )
}

export const FanpageSubmit = (participant: Participant) => (
    <Modal title='Fanpage Submit' close='Close' callbackId='fanpage-submit-main'>
        <Image src='https://hc-cdn.hel1.your-objectstorage.com/s/v3/b9ac83c2025ef408a2b9a5b1bb8bb51d8c226a58_image.png' alt='fanpage banner' />
        <Section>
            <p>Participating in fanpage? Make sure you complete these steps:</p>
        </Section>
        <Step 
            description='Accept the Hackatime Integrity Agreement'
            completed={Boolean(participant.acceptedIntegrity)}
            actionId='open-integrity'
            buttonText='Accept Agreement'
        />
        {
            participant.acceptedIntegrity ? (
                <>
                    <EditableStep 
                        description='Link your project from hackatime'
                        completed={Boolean(participant.hackatimeProject)}
                        actionId='open-hackatime-link'
                        buttonText='Link Project'
                        editButtonText='Change Project'
                    />
                    <EditableStep
                        description='Link a git/github repo with your project'
                        completed={Boolean(participant.gitLink)}
                        actionId='open-git-link'
                        buttonText='Link Repo'
                        editButtonText='Change Repo'
                    />
                    <EditableStep
                        description='(Optional) Add an art/hardware journal'
                        completed={Boolean(participant.journalLink)}
                        actionId='open-journal-link'
                        buttonText='Link Journal'
                        editButtonText='Change Journal'
                    />                    
                </>
            ) : (
                <Section>
                    <strong>Complete the previous step to continue.</strong>
                </Section>
            )
        }     
        {
            participant.acceptedIntegrity && participant.hackatimeProject && participant.gitLink ? (
                <EditableStep
                    description='Submit your fanpage project'
                    completed={Boolean(participant.submitted)}
                    actionId='open-fanpage-submit'
                    buttonText='Open Submit Form'
                    editButtonText='Reopen Submit Form'
                />
            ) : null
        }   
    </Modal>
)

app.command('/fanpage-link', async ({ command, ack, say }) => {
    await ack();

    let participant = await prisma.participant.findFirst({
        where: {
            slackId: command.user_id,
            ysws: "fanpage"
        }
    });

    if (!participant) {
        participant = await prisma.participant.create({
            data: {
                slackId: command.user_id,
                ysws: "fanpage"
            }
        });
    }

    await app.client.views.open({
        trigger_id: command.trigger_id,
        view: JSXSlack(FanpageSubmit(participant))
    });
});
