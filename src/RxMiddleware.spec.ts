import { Dispatch } from "redux";
import { Observable } from "rxjs";
import { rxMiddleware } from "./RxMiddleware";

describe("RxMiddleware", () => {
    let mockDispatch: jest.Mock;
    let dispatch: Dispatch<any>;

    beforeEach(() => {
        mockDispatch = jest.fn();
        dispatch = rxMiddleware()(mockDispatch);
    });

    it("handles Flux standard actions", () => {
        dispatch({
            type: "ACTION_TYPE",
            payload: Observable.from([1, 2, 3]),
        });

        expect(mockDispatch.mock.calls).toMatchSnapshot();
    });

    it("ignores non-observables", () => {
        dispatch({ type: "ACTION_TYPE" });
        expect(mockDispatch.mock.calls).toMatchSnapshot();
    });
});
