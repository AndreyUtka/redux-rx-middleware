import { Action, Middleware } from "redux";
import { ActionMeta } from "redux-actions";
import { Observable, Observer } from "rxjs";

/**
 * Represents sequence of execution an observable action.
 */
export enum Sequence {
    Start = "start",
    Next = "next",
    Error = "error",
    Complete = "complete",
}

/**
 * action META key
 */
export const OBSERVABLE_API = "@api/OBSERVABLE_API";

export interface ObservableApi<TObservable = any> {
    stream: Observable<TObservable>;
}

/**
 * Incoming action META type
 */
export interface ObservableMetaIn<TObservable = any> {
    [OBSERVABLE_API]: ObservableApi<TObservable>;
}

/**
 * Out coming action META type
 */
export interface ObservableMetaOut {
    [OBSERVABLE_API]: {
        sequence: Sequence;
    };
}

/**
 * Action with Observable META
 */
export type ObservableAction<TPayload = any> = ActionMeta<TPayload, ObservableMetaIn>;

type TypedAction = Action | ObservableAction;

class ActionObserver implements Observer<any> {
    constructor(
        private action: ObservableAction,
        private onNext: (newAction: ActionMeta<any, ObservableMetaOut>) => void
    ) {
        this.start();
    }

    public next(data: any) {
        this.onNext(this.createAction(Sequence.Next, data));
    }

    public error(error: any) {
        this.onNext(this.createAction(Sequence.Error, error, true));
    }

    public complete() {
        this.onNext(this.createAction(Sequence.Complete));
    }

    private start() {
        this.onNext(this.createAction(Sequence.Start));
    }

    private createAction(
        sequence: Sequence,
        newPayload: any = null,
        error = false
    ): ActionMeta<any, ObservableMetaOut> {
        const { payload, meta, ...action } = this.action;
        const newAction: ActionMeta<any, ObservableMetaOut> = {
            ...action,
            meta: { ...meta, [OBSERVABLE_API]: { sequence } },
        };
        if (newPayload) {
            newAction.payload = newPayload;
        }
        return error ? { ...newAction, error: true } : newAction;
    }
}

/**
 * A Redux middleware that processes Observable actions.
 *
 * @type {ReduxMiddleware}
 * @access public
 */
export const rxMiddleware: Middleware = () => (next) => <A extends TypedAction>(action: A): A => {
    const observableApi: ObservableApi =
        (action as ActionMeta<any, any>).meta && (action as ActionMeta<any, any>).meta[OBSERVABLE_API];

    if (!observableApi) {
        return next(action);
    }

    const { stream } = observableApi;

    // double check for non typescript projects
    if (!(stream instanceof Observable)) {
        throw new Error("stream property must be Observable");
    }

    stream.subscribe(
        new ActionObserver(action as ObservableAction, (newAction: ActionMeta<any, ObservableMetaOut>) =>
            next(newAction)
        )
    );

    return action;
};
