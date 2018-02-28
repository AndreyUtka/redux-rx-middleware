import { Action, Dispatch } from "redux";
import { Observable } from "rxjs";

interface FSA<TPayload = any, TMeta = any> extends Action {
    payload: TPayload;
    error?: boolean;
    meta?: TMeta;
}

export type ObservableAction<TObservable = any, TMeta = any> = FSA<Observable<TObservable>, TMeta>;
type TypedAction = Action | FSA<any> | ObservableAction<any>;
type RxMiddleware = <S>() => (next: Dispatch<S>) => <A extends TypedAction>(action: A) => A;

interface IMeta {
    sequence: Sequence;
}

export enum Sequence {
    Next = "next",
    Error = "error",
    Complete = "complete",
}

export const rxMiddleware: RxMiddleware = () => (next) => <A extends TypedAction>(action: A): A => {
    if ((action as FSA).payload instanceof Observable) {
        (action as ObservableAction).payload.subscribe({
            next: (data) => next({ type: action.type, payload: data, meta: { sequence: Sequence.Next } }),
            error: (err) => next({ type: action.type, payload: err, error: true, meta: { sequence: Sequence.Error } }),
            complete: () => next({ type: action.type, meta: { sequence: Sequence.Complete } }),
        });
        return action;
    }

    return next(action);
};
