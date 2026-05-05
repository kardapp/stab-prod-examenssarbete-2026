export function calculatePresenceNeed(
    visitsPerWeek: number,
    averageMinutesPerVisit: number,
    weeklyWorkHours: number
): number {
    const weeklyWorkMinutes = weeklyWorkHours * 60;

    if (weeklyWorkMinutes <= 0) {
        return 0;
    }

    return (visitsPerWeek * averageMinutesPerVisit) / weeklyWorkMinutes;
}