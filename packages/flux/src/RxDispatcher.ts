import { Dispatcher } from "flux";
import { isFSA } from "flux-standard-action";

export class RxDispatcher extends Dispatcher {
    dispatchObservable(payload: TPayload): void {}
}
