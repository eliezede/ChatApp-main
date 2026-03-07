import { Timesheet } from '../../timesheets/types';
import { Job } from '../../jobs/types';
import { Rate } from '../types';

export const calculateInterpreterAmount = (timesheet: Timesheet, job: Job, rate: Rate): number => {
    if (!timesheet.actualStart || !timesheet.actualEnd) return 0;

    const start = new Date(timesheet.actualStart);
    const end = new Date(timesheet.actualEnd);
    const diffMs = end.getTime() - start.getTime();
    let durationMinutes = Math.floor(diffMs / 60000);

    // Subtract break
    durationMinutes -= (timesheet.breakDurationMinutes || 0);
    if (durationMinutes < 0) durationMinutes = 0;

    // Use hours
    const units = durationMinutes / 60;

    // Interpreters also have minimum units
    const payableUnits = Math.max(units, rate.minimumUnits || 1);

    return payableUnits * rate.amountPerUnit;
};
