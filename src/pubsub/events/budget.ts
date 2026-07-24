import { Event } from "./event";

export class BudgetLimitApproachingEvent implements Event {
    constructor(
        public readonly budgetId: number,
        public readonly budgetName: string,
    ) {}

    get type() {
        return "budget.limit_approaching";
    }
}

export class BudgetUpdatedEvent implements Event {
    constructor(
        public readonly budgetId: number,
        public readonly userId: number,
    ) {}

    get type() {
        return "budget.updated";
    }
}
