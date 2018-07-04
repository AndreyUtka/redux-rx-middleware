import { Dispatch } from "redux";
import { concat, from, of, throwError } from "rxjs";
import { OBSERVABLE_API, ObservableAction, ObservableApi, rxMiddleware, Sequence } from "./";

describe("RxMiddleware", () => {
    let mockDispatch: jest.Mock;
    let dispatch: Dispatch<any>;

    beforeEach(() => {
        mockDispatch = jest.fn();
        dispatch = rxMiddleware(null)(mockDispatch);
    });

    it("should handle Flux standard actions", () => {
        const action: ObservableAction<number> = {
            type: "ACTION_TYPE",
            meta: {
                [OBSERVABLE_API]: {
                    stream: from([1, 2, 3]),
                },
            },
        };

        dispatch(action);

        expect(mockDispatch.mock.calls).toEqual([
            [
                {
                    meta: {
                        [OBSERVABLE_API]: { sequence: Sequence.Start },
                    },
                    type: "ACTION_TYPE",
                },
            ],
            [
                {
                    meta: {
                        [OBSERVABLE_API]: { sequence: Sequence.Next },
                    },
                    payload: 1,
                    type: "ACTION_TYPE",
                },
            ],
            [
                {
                    meta: {
                        [OBSERVABLE_API]: { sequence: Sequence.Next },
                    },
                    payload: 2,
                    type: "ACTION_TYPE",
                },
            ],
            [
                {
                    meta: {
                        [OBSERVABLE_API]: { sequence: Sequence.Next },
                    },
                    payload: 3,
                    type: "ACTION_TYPE",
                },
            ],
            [
                {
                    meta: {
                        [OBSERVABLE_API]: { sequence: Sequence.Complete },
                    },
                    type: "ACTION_TYPE",
                },
            ],
        ]);
    });

    it("should handle actions with error", () => {
        const error = new Error();
        const action: ObservableAction<number> = {
            type: "ACTION_TYPE",
            meta: {
                [OBSERVABLE_API]: {
                    stream: concat(of(1, 2), throwError(error), of(3)),
                },
            },
        };

        dispatch(action);

        expect(mockDispatch.mock.calls).toEqual([
            [
                {
                    meta: {
                        [OBSERVABLE_API]: { sequence: Sequence.Start },
                    },
                    type: "ACTION_TYPE",
                },
            ],
            [
                {
                    meta: {
                        [OBSERVABLE_API]: { sequence: Sequence.Next },
                    },
                    payload: 1,
                    type: "ACTION_TYPE",
                },
            ],
            [
                {
                    meta: {
                        [OBSERVABLE_API]: { sequence: Sequence.Next },
                    },
                    payload: 2,
                    type: "ACTION_TYPE",
                },
            ],
            [
                {
                    meta: {
                        [OBSERVABLE_API]: { sequence: Sequence.Error },
                    },
                    payload: error,
                    error: true,
                    type: "ACTION_TYPE",
                },
            ],
        ]);
    });

    it("should not override additional action fields", () => {
        interface MyObservableAction extends ObservableAction<number> {
            meta: {
                [OBSERVABLE_API]: ObservableApi;
                test: string;
            };
        }

        const action: MyObservableAction = {
            type: "ACTION_TYPE",
            meta: {
                test: "test",
                [OBSERVABLE_API]: {
                    stream: from([1, 2, 3]),
                },
            },
        };

        dispatch(action);

        expect(mockDispatch.mock.calls).toEqual([
            [
                {
                    meta: {
                        [OBSERVABLE_API]: { sequence: Sequence.Start },
                        test: "test",
                    },
                    type: "ACTION_TYPE",
                },
            ],
            [
                {
                    meta: {
                        [OBSERVABLE_API]: { sequence: Sequence.Next },
                        test: "test",
                    },
                    payload: 1,
                    type: "ACTION_TYPE",
                },
            ],
            [
                {
                    meta: {
                        [OBSERVABLE_API]: { sequence: Sequence.Next },
                        test: "test",
                    },
                    payload: 2,
                    type: "ACTION_TYPE",
                },
            ],
            [
                {
                    meta: {
                        [OBSERVABLE_API]: { sequence: Sequence.Next },
                        test: "test",
                    },
                    payload: 3,
                    type: "ACTION_TYPE",
                },
            ],
            [
                {
                    meta: {
                        [OBSERVABLE_API]: { sequence: Sequence.Complete },
                        test: "test",
                    },
                    type: "ACTION_TYPE",
                },
            ],
        ]);
    });

    it("should through error if meta type is not Observable", () => {
        const action = {
            type: "ACTION_TYPE",
            meta: {
                [OBSERVABLE_API]: {
                    stream: Promise.resolve(),
                },
            },
        };

        expect(() => dispatch(action)).toThrow("stream property must be Observable");
    });

    it("should ignore non-observables", () => {
        dispatch({ type: "ACTION_TYPE" });
        expect(mockDispatch.mock.calls).toEqual([[{ type: "ACTION_TYPE" }]]);
    });

    it("should save origin payload", () => {
        const action: ObservableAction = {
            type: "ACTION_TYPE",
            payload: { test: "test" },
            meta: {
                [OBSERVABLE_API]: {
                    stream: from([1, 2, 3]),
                },
            },
        };

        dispatch(action);

        expect(mockDispatch.mock.calls).toEqual([
            [
                {
                    meta: {
                        [OBSERVABLE_API]: { sequence: Sequence.Start },
                    },
                    payload: { test: "test" },
                    type: "ACTION_TYPE",
                },
            ],
            [
                {
                    meta: {
                        [OBSERVABLE_API]: { sequence: Sequence.Next },
                    },
                    payload: 1,
                    type: "ACTION_TYPE",
                },
            ],
            [
                {
                    meta: {
                        [OBSERVABLE_API]: { sequence: Sequence.Next },
                    },
                    payload: 2,
                    type: "ACTION_TYPE",
                },
            ],
            [
                {
                    meta: {
                        [OBSERVABLE_API]: { sequence: Sequence.Next },
                    },
                    payload: 3,
                    type: "ACTION_TYPE",
                },
            ],
            [
                {
                    meta: {
                        [OBSERVABLE_API]: { sequence: Sequence.Complete },
                    },
                    payload: { test: "test" },
                    type: "ACTION_TYPE",
                },
            ],
        ]);
    });
});
