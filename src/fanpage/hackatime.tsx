/** @jsxImportSource jsx-slack */
import JSXSlack, { Blocks, Button, Image, Input, Modal, Option, Section, Select } from 'jsx-slack';
import { app, prisma } from '../app';
import { queryStats, type Stats } from "../hackatime";
import { FanpageSubmit } from './fanpage';

const queryFanpage = async (userId: string) => await queryStats({
    userId,
    startDate: new Date('2025-10-03'),
    endDate: new Date('2025-10-24')
});

const HackatimeSelect = (parentViewId: string, stats: Stats, alreadyLinked: string | null) => (
    <Modal title='Link Hackatime Project' close='Close' callbackId='hackatime-link' privateMetadata={parentViewId}>
        <Input label='Hackatime Project' title='Please select a hackatime project' blockId='hackatime_input' required>
            <Select value={alreadyLinked || undefined} placeholder='Select a project to link' actionId='hackatime_select'>
                {stats.data.projects.map(project => (
                    <Option value={project.name}>{project.name} - {project.hours} hrs</Option>
                ))}
            </Select>
        </Input>
    </Modal>
)

app.action('open-hackatime-link', async ({ body, ack, client }) => {
    await ack();

    console.log('recieved hackatime link action');

    const stats = await queryFanpage(body.user.id);

    const alreadyLinked = await prisma.participant.findFirst({
        where: {
            slackId: body.user.id,
            ysws: "fanpage"
        }
    }).then(p => p?.hackatimeProject);

    await client.views.push({
        //@ts-ignore
        trigger_id: body.trigger_id,
        //@ts-ignore
        view: JSXSlack(HackatimeSelect(body.view.id, stats, alreadyLinked))
    });
});

app.view('hackatime-link', async ({ body, ack, client }) => {
    await ack();
    
    console.log('recieved hackatime link submission');

    //@ts-ignore
    const project = body.view.state.values.hackatime_input.hackatime_select.selected_option.value;

    await prisma.participant.updateMany({
        where: {
            slackId: body.user.id,
            ysws: "fanpage"
        },
        data: {
            hackatimeProject: project
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