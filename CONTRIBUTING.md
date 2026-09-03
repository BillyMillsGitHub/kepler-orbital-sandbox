# Contributing to Kepler

`main` is the stable branch. Do not commit to it directly. Every change — docs, features, fixes — goes through its own branch and a pull request. If a piece of work is really two concerns, split it into two branches so either one can be reverted without taking the other.

## Flow

1. Update `main`.
2. Branch from `main` with a name that says what the change is:
   - `feat/…` a playable change (inspector, physics, a new scene)
   - `fix/…` a bug
   - `docs/…` README, license, contributing
   - `chore/…` tooling, config
3. Open a pull request into `main`.
4. Merge the PR (merge commit, so the branch is visible in history).
5. Delete the branch.

```text
main          ●──────────────●──────────────●
               \            / \            /
docs/readme     ●──────────●   \          /
feat/inspector                  ●────────●
```

## Branch names

Keep them short and lowercase:

- `feat/speed-inspector`
- `fix/moon-spawn-overlap`
- `docs/github-flow`

One concern per branch. A HUD change and a physics change are two pull requests.

## Pull requests

Use the PR template. Say **what** changed and **how to try it**.

You do not need a review from someone else to merge your own PR on this repo. You do need a PR.

## License

By contributing you agree your changes ship under the MIT License, copyright BMills. Keep the `LICENSE` file as it is.
