import { Dispatch } from "redux";
import { concat } from "rxjs/observable/concat";
import { from } from "rxjs/observable/from";
import { of } from "rxjs/observable/of";
import { _throw } from "rxjs/observable/throw";
import { IObservableAction, rxMiddleware, Sequence } from "./";

describe("RxMiddleware", () => {
    let mockDispatch: jest.Mock;
    let dispatch: Dispatch<any>;

    beforeEach(() => {
        mockDispatch = jest.fn();
        dispatch = rxMiddleware()(mockDispatch);
    });

    it("should handle Flux standard actions", () => {
        const action: IObservableAction<number> = {
            type: "ACTION_TYPE",
            payload: from([1, 2, 3]),
        };
        dispatch(action);

        expect(mockDispatch.mock.calls).toEqual([
            [{ meta: { sequence: Sequence.Start }, type: "ACTION_TYPE" }],
            [{ meta: { sequence: Sequence.Next }, payload: 1, type: "ACTION_TYPE" }],
            [{ meta: { sequence: Sequence.Next }, payload: 2, type: "ACTION_TYPE" }],
            [{ meta: { sequence: Sequence.Next }, payload: 3, type: "ACTION_TYPE" }],
            [{ meta: { sequence: Sequence.Complete }, type: "ACTION_TYPE" }],
        ]);
    });

    it("should handle actions with error", () => {
        const error = new Error();
        const action: IObservableAction<number> = {
            type: "ACTION_TYPE",
            payload: concat(of(1, 2), _throw(error), of(3)),
        };
        dispatch(action);

        expect(mockDispatch.mock.calls).toEqual([
            [{ meta: { sequence: Sequence.Start }, type: "ACTION_TYPE" }],
            [{ meta: { sequence: Sequence.Next }, payload: 1, type: "ACTION_TYPE" }],
            [{ meta: { sequence: Sequence.Next }, payload: 2, type: "ACTION_TYPE" }],
            [{ meta: { sequence: Sequence.Error }, payload: error, error: true, type: "ACTION_TYPE" }],
        ]);
    });

    it("should not override additional action fields", () => {
        const action: IObservableAction<number> = {
            type: "ACTION_TYPE",
            payload: from([1, 2, 3]),
            meta: {
                test: "test",
            },
        };
        dispatch(action);

        expect(mockDispatch.mock.calls).toEqual([
            [{ meta: { sequence: Sequence.Start, test: "test" }, type: "ACTION_TYPE" }],
            [{ meta: { sequence: Sequence.Next, test: "test" }, payload: 1, type: "ACTION_TYPE" }],
            [{ meta: { sequence: Sequence.Next, test: "test" }, payload: 2, type: "ACTION_TYPE" }],
            [{ meta: { sequence: Sequence.Next, test: "test" }, payload: 3, type: "ACTION_TYPE" }],
            [{ meta: { sequence: Sequence.Complete, test: "test" }, type: "ACTION_TYPE" }],
        ]);
    });

    it("should ignore non-observables", () => {
        dispatch({ type: "ACTION_TYPE" });
        expect(mockDispatch.mock.calls).toEqual([[{ type: "ACTION_TYPE" }]]);
    });
});
