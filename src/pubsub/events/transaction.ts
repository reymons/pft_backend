import { Event } from "./event";

export class TransactionUpdatedEvent implements Event {
    constructor(
        public readonly trxId: number,
        public readonly userId: number,
    ) {}

    get type() {
        return "transaction.updated";
    }
}
