import { Timesheet } from '../../timesheets/types';
import { Job } from '../../jobs/types';
import { Rate } from '../types';

export const calculateClientAmount = (timesheet: Timesheet, job: Job, rate: Rate): number => {
    if (!timesheet.actualStart || !timesheet.actualEnd) return 0;

    const start = new Date(timesheet.actualStart);
    const end = new Date(timesheet.actualEnd);
    const diffMs = end.getTime() - start.getTime();
    let durationMinutes = Math.floor(diffMs / 60000);

    // Subtract break
    durationMinutes -= (timesheet.breakDurationMinutes || 0);
    if (durationMinutes < 0) durationMinutes = 0;

    // For this generic model, we use hours
    const units = durationMinutes / 60;

    // Apply minimum units defined in rate
    const billableUnits = Math.max(units, rate.minimumUnits || 1);

    return billableUnits * rate.amountPerUnit;
};
