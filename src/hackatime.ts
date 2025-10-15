export type Project = {
    name: string;
    total_seconds: number;
    text: string;
    hours: number;
    minutes: number;
    percent: number;
    digital: string;
};

export type Stats = {
    data: {
        username: string;
        user_id: string;
        is_coding_activity_visible: boolean;
        is_other_usage_visible: boolean;
        status: string;
        start: string;
        end: string;
        range: string;
        human_readable_range: string;
        total_seconds: number;
        daily_average: number;
        human_readable_total: string;
        human_readable_daily_average: string;
        projects: Project[];
    };
    trust_factor: {
        trust_level: string;
        trust_value: number;
    }
};

export async function queryStats(query: {
    userId: string;
    startDate: Date;
    endDate: Date;
}) {
    const response = await fetch(
        `https://hackatime.hackclub.com/api/v1/users/${query.userId}/stats?features=projects&start_date=${query.startDate.toISOString()}&end_date=${query.endDate.toISOString()}&test_param=true`
    );

    return response.json() as Promise<Stats>;
}

// {
//   data: {
//     username: "manitej",
//     user_id: "100",
//     is_coding_activity_visible: true,
//     is_other_usage_visible: true,
//     status: "ok",
//     start: "2025-09-01T00:00:00Z",
//     end: "2025-10-01T00:00:00Z",
//     range: "all_time",
//     human_readable_range: "All Time",
//     total_seconds: 192111,
//     daily_average: 6403,
//     human_readable_total: "53h 21m 51s",
//     human_readable_daily_average: "1h 46m 43s",
//     projects: [
// {
//   name: "<<LAST_PROJECT>>",
//   total_seconds: 50241,
//   text: "13h 57m",
//   hours: 13,
//   minutes: 57,
//   percent: 26.15,
//   digital: "13:57:21",
// }
//     ],
//   },
//   trust_factor: {
//     trust_level: "blue",
//     trust_value: 0,
//   },