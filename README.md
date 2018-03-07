# redux-rx-middleware

[![build status](https://img.shields.io/travis/AndreyUtka/redux-rx-middleware/master.svg?style=flat-square)](https://travis-ci.org/AndreyUtka/redux-rx-middleware)
[![Codecov](https://img.shields.io/codecov/c/github/AndreyUtka/redux-rx-middleware.svg?style=flat-square)](https://codecov.io/gh/AndreyUtka/redux-rx-middleware)
[![npm version](https://img.shields.io/npm/v/redux-rx-middleware.svg?style=flat-square)](https://www.npmjs.com/package/redux-rx-middleware)
[![npm downloads](https://img.shields.io/npm/dm/redux-rx-middleware.svg?style=flat-square)](https://www.npmjs.com/package/redux-rx-middleware)

## dependencies
- `redux` because it's middleware for redux
- `rxjs` because it's rx middleware
- `tslib` for `cls` and `esm` packages it uses three shaking to decrease bundle size
- `@types/redux-actions` for support FSA for redux

For the official integration (from core contributors) with [RxJS](http://reactivex.io/rxjs/) and [Redux](https://redux.js.org/), please take a look at [redux-observable](https://redux-observable.js.org)

This is just simple middleware as like as [redux-promise](https://github.com/redux-utilities/redux-promise) which brings support [Rx.Observable](http://reactivex.io/rxjs/class/es6/Observable.js~Observable.html) for the actions.

### Why not just redux-observable?

at first redux-observable uses [Epics](https://redux-observable.js.org/docs/basics/Epics.html) to describe async actions in redux.

> Epic is a function which takes a stream of actions and returns a stream of actions. Actions in, actions out.

so you can feel free to manage your stream of actions with Epics.
this redux-rx-middleware provides 2 things:

*   in case if payload is Observable, it will subscribe to this Observable stream
*   it will handle one Observable action to many simple actions with different state of execution. It means for exmaple incoming action:

```typescript
{
    type: "ACTION_TYPE",
    payload: Rx.Observable.from([1, 2, 3]),
}
```

outcoming actions will be

```typescript
{
    type: "ACTION_TYPE",
    meta: { sequence: "start" }
}
------------------------------
              |
              |
              V
{
    type: "ACTION_TYPE",
    payload: 1,
    meta: { sequence: "next" }
}
------------------------------
              |
              |
              V
{
    type: "ACTION_TYPE",
    payload: 2,
    meta: { sequence: "next" }
}
------------------------------
              |
              |
              V
{
    type: "ACTION_TYPE",
    payload: 3,
    meta: { sequence: "next" }
}
------------------------------
              |
              |
              V
{
    type: "ACTION_TYPE",
    meta: { sequence: "complete" }
}
```

Why does it mapped one async action to many sync actions?
In genernal overivew the async action can has one type but different states:

```
({type: "GET_USERS", sequence: "start" })
    -> ({type: "GET_USERS", sequence: "done" })
        -> ({type: "GET_USERS", sequence: "error" })
```

or as usual in redux applications, different types araund the one async action:

```
({type: "GET_USERS" })
    -> ({type: "GET_USERS_DONE"})
        -> ({type: "GET_USERS_ERROR"})
```

The benefit of the first flow that in the both cases you need to handle this actions in reducer by sequence state or
by action type, but you can delegate the creation of the state actions to middleware, don't create addition action
by your self. The main goal of this simle middleware that one async action (with Rx api) has differnt states and you can just handle it reducer
