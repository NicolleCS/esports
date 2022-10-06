export function ConvertMinutesToHourString(minutes: number) {
    const hours = String(Math.floor(minutes / 60));
    const minutesAmount = String(minutes % 60);

    return `${hours.padStart(2, '0')}:${minutesAmount.padStart(2, '0')}`;
}    