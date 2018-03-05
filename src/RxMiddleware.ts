import { Action, Dispatch } from "redux";
import { Observable } from "rxjs/Observable";
import { Observer } from "rxjs/Observer";

interface FSA<TPayload = any, TMeta = any> extends Action {
    payload?: TPayload;
    error?: boolean;
    meta?: TMeta;
}

export enum Sequence {
    Next = "next",
    Error = "error",
    Complete = "complete",
}

export type ObservableAction<TObservable = any, TMeta = any> = FSA<Observable<TObservable>, TMeta>;
type TypedAction = Action | FSA | ObservableAction;
type RxMiddleware = <S>() => (next: Dispatch<S>) => <A extends TypedAction>(action: A) => A;

class ActionObserver implements Observer<any> {
    constructor(private action: ObservableAction, private onNext: (newAction: FSA) => void) {}

    public next(data: any) {
        this.onNext(this.createAction(Sequence.Next, data));
    }

    public error(error: any) {
        this.onNext(this.createAction(Sequence.Error, error, true));
    }

    public complete() {
        this.onNext(this.createAction(Sequence.Complete));
    }

    private createAction(sequence: Sequence, newPayload: any = null, error = false): FSA {
        const { payload, meta, ...action } = this.action;
        const newAction: FSA = { ...action, meta: { ...meta, sequence } };
        if (newPayload) {
            newAction.payload = newPayload;
        }
        return error ? { ...newAction, error: true } : newAction;
    }
}

export const rxMiddleware: RxMiddleware = () => (next) => <A extends TypedAction>(action: A): A => {
    if ((action as FSA).payload instanceof Observable) {
        (action as ObservableAction).payload.subscribe(new ActionObserver(action, (newAction: FSA) => next(newAction)));
        return action;
    }

    return next(action);
};
