## How to write test

1. DO NOT check log string in test, for example `expect().toThrow("Slug must contain only lowercase")` is not good choice, because log string may change. `expect().toThrow("Slug must contain only lowercase")` is good.
