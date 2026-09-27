const EXPERIENCE_START_YEAR = 2014;

export function getExperienceYears(): number {
    return new Date().getFullYear() - EXPERIENCE_START_YEAR;
}
