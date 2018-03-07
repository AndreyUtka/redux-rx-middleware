# redux-rx-middleware

[![build status](https://img.shields.io/travis/AndreyUtka/redux-rx-middleware/master.svg?style=flat-square)](https://travis-ci.org/AndreyUtka/redux-rx-middleware)
[![Codecov](https://img.shields.io/codecov/c/github/AndreyUtka/redux-rx-middleware.svg?style=flat-square)](https://codecov.io/gh/AndreyUtka/redux-rx-middleware)
[![npm version](https://img.shields.io/npm/v/redux-rx-middleware.svg?style=flat-square)](https://www.npmjs.com/package/redux-rx-middleware)
[![npm downloads](https://img.shields.io/npm/dm/redux-rx-middleware.svg?style=flat-square)](https://www.npmjs.com/package/redux-rx-middleware)

For the official integration (from core contributors) with [RxJS](http://reactivex.io/rxjs/) and [Redux](https://redux.js.org/), please look at [redux-observable](https://redux-observable.js.org)

This is just simple middleware as like as [redux-promise](https://github.com/redux-utilities/redux-promise) which brings support [Rx.Observable](http://reactivex.io/rxjs/class/es6/Observable.js~Observable.html)  for the actions.

### Why not just redux-observable?

at first redux-observable uses [Epics](https://redux-observable.js.org/docs/basics/Epics.html) to describe async actions in redux.
> Epic is a function which takes a stream of actions and returns a stream of actions. Actions in, actions out.

so you can feel free to manage your stream of actions with Epics.
this redux-rx-middleware provides 2 thisngs:
- in case if payload be Observable, it will subscribe to this Observable stream
- it will handle one Observable action to many simple actions with different state of execution. It means for exmaple incoming action:
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

