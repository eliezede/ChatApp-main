import { ProfitStats } from '../types';

export const calculateProfit = (
    clientAmount: number,
    interpreterAmount: number,
    extraCosts: number = 0
): ProfitStats => {
    const totalCost = interpreterAmount + extraCosts;
    const profit = clientAmount - totalCost;
    const marginPercentage = clientAmount > 0 ? (profit / clientAmount) * 100 : 0;

    return {
        clientAmount,
        interpreterAmount,
        extraCosts,
        profit,
        marginPercentage
    };
};
