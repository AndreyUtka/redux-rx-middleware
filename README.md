# redux-rx-middleware

🤪 simple rxjs integration for redux

[![build status](https://img.shields.io/travis/AndreyUtka/redux-rx-middleware/master.svg?style=flat-square)](https://travis-ci.org/AndreyUtka/redux-rx-middleware)
[![Codecov](https://img.shields.io/codecov/c/github/AndreyUtka/redux-rx-middleware.svg?style=flat-square)](https://codecov.io/gh/AndreyUtka/redux-rx-middleware)
[![npm version](https://img.shields.io/npm/v/redux-rx-middleware.svg?style=flat-square)](https://www.npmjs.com/package/redux-rx-middleware)
[![npm downloads](https://img.shields.io/npm/dm/redux-rx-middleware.svg?style=flat-square)](https://www.npmjs.com/package/redux-rx-middleware)

### install

`npm i redux-rx-middleware`

or

`yarn add redux-rx-middleware`

### dependencies

- `redux` because it's middleware for redux
- `rxjs` because it's rx middleware
- `tslib` for `cls` and `esm` packages it uses three shaking to decrease bundle size
- `@types/redux-actions` for support FSA for redux

### usage

add middleware

```typescript
import { rxMiddleware } from "redux-rx-middleware";
```
dispatch action with observable stream
```typescript
import { from } from "rxjs/observable/from";
import { OBSERVABLE_API, ObservableAction } from "redux-rx-middleware";

export function observableAction(): ObservableAction<number> {
    return {
        type: "ACTION_TYPE",
        meta: {
            [OBSERVABLE_API]: {
                stream: from([1, 2, 3]),
            },
        },
    };
}
```

For the official integration (from core contributors) with [RxJS](http://reactivex.io/rxjs/) and [Redux](https://redux.js.org/), please take a look at [redux-observable](https://redux-observable.js.org)

This is just simple middleware as like as [redux-promise](https://github.com/redux-utilities/redux-promise) which brings support [Rx.Observable](http://reactivex.io/rxjs/class/es6/Observable.js~Observable.html) for the actions.

### Why not just redux-observable?

first of all, redux-observable uses [Epics](https://redux-observable.js.org/docs/basics/Epics.html) to describe async actions in redux.

> Epic is a function which takes a stream of actions and returns a stream of actions. Actions in, actions out.

so you can feel free to manage your stream of actions with Epics.
this redux-rx-middleware provides 2 things:

*   in case if `meta` has a key with an Observable stream, it will subscribe to this stream
*   it will handle one Observable action to many simple actions with a different state of execution. It means, for example, incoming action:

```typescript
{
    type: "ACTION_TYPE",
    meta: {
        ["@api/OBSERVABLE_API"]: {
            stream: from([1, 2, 3]),
        },
    },
}
```

outgoing actions will be

```typescript
{
    type: "ACTION_TYPE",
    meta: {
        ["@api/OBSERVABLE_API"]: {
            sequence: "start",
        },
    },
}
------------------------------
              |
              |
              V
{
    type: "ACTION_TYPE",
    payload: 1,
    meta: {
        ["@api/OBSERVABLE_API"]: {
            sequence: "next",
        },
    },
}
------------------------------
              |
              |
              V
{
    type: "ACTION_TYPE",
    payload: 2,
    meta: {
        ["@api/OBSERVABLE_API"]: {
            sequence: "next",
        },
    },
}
------------------------------
              |
              |
              V
{
    type: "ACTION_TYPE",
    payload: 3,
    meta: {
        ["@api/OBSERVABLE_API"]: {
            sequence: "next",
        },
    },
}
------------------------------
              |
              |
              V
{
    type: "ACTION_TYPE",
    meta: {
        ["@api/OBSERVABLE_API"]: {
            sequence: "complete",
        },
    },
}
```

Why does it mapped one async action to many sync actions? In general overview the async action can has one type but different states:

```
({type: "GET_USERS", sequence: "start" })
                  👇🏼
({type: "GET_USERS", sequence: "done" })
                  👇🏼
({type: "GET_USERS", sequence: "error" })
```

or as usual in redux applications, different types around the one async action:

```
({type: "GET_USERS" })
          👇🏼
({type: "GET_USERS_DONE"})
          👇🏼
({type: "GET_USERS_ERROR"})
```

The benefit of the first flow that in both cases you need to handle this actions in reducer by sequence state or by action type, but you can delegate the creation of the state actions to middleware, don't create additional action by yourself. The main goal of this simple middleware that one async action (with Rx API) has different states and you can just handle it in your reducer.
