import { Action, Dispatch } from "redux";
import { Action as ActionPayload, ActionMeta } from "redux-actions";
import { Observable } from "rxjs/Observable";
import { Observer } from "rxjs/Observer";

export enum Sequence {
    Next = "next",
    Error = "error",
    Complete = "complete",
}

export interface IObservableMeta {
    sequence: Sequence;
}

export interface IObservableAction<TObservable = any, TMeta = any> extends ActionPayload<Observable<TObservable>> {
    meta?: TMeta;
}

export type TypedAction = Action | ActionPayload<any> | IObservableAction;
export type RxMiddleware = <S>() => (next: Dispatch<S>) => <A extends TypedAction>(action: A) => A;

class ActionObserver implements Observer<any> {
    constructor(
        private action: IObservableAction,
        private onNext: (newAction: ActionMeta<any, IObservableMeta>) => void
    ) {}

    public next(data: any) {
        this.onNext(this.createAction(Sequence.Next, data));
    }

    public error(error: any) {
        this.onNext(this.createAction(Sequence.Error, error, true));
    }

    public complete() {
        this.onNext(this.createAction(Sequence.Complete));
    }

    private createAction(sequence: Sequence, newPayload: any = null, error = false): ActionMeta<any, IObservableMeta> {
        const { payload, meta, ...action } = this.action;
        const newAction: ActionMeta<any, any> = { ...action, meta: { ...meta, sequence } };
        if (newPayload) {
            newAction.payload = newPayload;
        }
        return error ? { ...newAction, error: true } : newAction;
    }
}

export const rxMiddleware: RxMiddleware = () => (next) => <A extends TypedAction>(action: A): A => {
    if ((action as ActionPayload<any>).payload instanceof Observable) {
        (action as IObservableAction).payload.subscribe(
            new ActionObserver(action, (newAction: ActionMeta<any, IObservableMeta>) => next(newAction))
        );
        return action;
    }

    return next(action);
};
