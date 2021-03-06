## [1.1.2](https://github.com/edmundhung/maildog/compare/v1.1.1...v1.1.2) (2021-08-13)


### Bug Fixes

* **extensions:** ensure the extensions refresh badge and context menu after decrypting the config ([39a8f56](https://github.com/edmundhung/maildog/commit/39a8f5636710a0d70bbca5f34d317e200e2cec30))
* **extensions:** incognito should not share session just like cookie ([881c8e7](https://github.com/edmundhung/maildog/commit/881c8e7d7ade3a02aec7adbf7e01569390242dc4))


### Features

* **extensions:** bootstrap extensions setup based on the web-extension-starter ([40c084b](https://github.com/edmundhung/maildog/commit/40c084b755eb64741855ccae949e8f32745bb02d))
* **extensions:** ensure emails filtering logic compares the host only ([966484d](https://github.com/edmundhung/maildog/commit/966484d648bbbff5bf47c1fc010806071f79adbe))
* **extensions:** implement decrypt config flow ([c5c73f7](https://github.com/edmundhung/maildog/commit/c5c73f7006a70c2a15ef4c8924bb0a393c33e040))
* **extensions:** implement generate email functionality ([a03be6d](https://github.com/edmundhung/maildog/commit/a03be6d386a8c497c2bd51222a5f339fa730f637))
* **extensions:** implement login / logout flow ([de9502e](https://github.com/edmundhung/maildog/commit/de9502e04ef998d3d94f607c122ecaf873ed4a77))
* **extensions:** keep track of active tab host for looking up emails ([389f560](https://github.com/edmundhung/maildog/commit/389f56069a0a74d6df0310e4a4f662a1401d3432))
* **extensions:** setup tailwindcss ([91906b4](https://github.com/edmundhung/maildog/commit/91906b4fcd954403a516a5c89ff1cf77fe9f08f8))
* **extensions:** simplify context menu setup if only 1 domain is configured ([b6308be](https://github.com/edmundhung/maildog/commit/b6308be57617d7361fff30b258a12b78190e35b4))
* **extensions:** update context menu on tab update ([7502c1d](https://github.com/edmundhung/maildog/commit/7502c1dbd4d5fb97d8905a7970f06ec0fcad7ae7))
* **web:** add get /config endpoint ([e6f14c7](https://github.com/edmundhung/maildog/commit/e6f14c73b36155ae496d6be8134cd1b058c8f49a))
* **web:** implement put /api/{owner}/{repo}/config for saving updated config file ([e6f8f3c](https://github.com/edmundhung/maildog/commit/e6f8f3cd968c1201582893c0581bfeb909fdb2d9))

## [1.1.1](https://github.com/edmundhung/maildog/compare/v1.1.0...v1.1.1) (2021-07-24)


### Bug Fixes

* **web:** type-checking for web app ([c30dfab](https://github.com/edmundhung/maildog/commit/c30dfab783045252d39b4aff450b8a9ae530893f))


### Features

* **web:** implement api route with session api as example ([86814dd](https://github.com/edmundhung/maildog/commit/86814dd8e6005cbec57076e50cff01216dcbbecd))
* **web:** implement github oauth web application flow with installation support ([9688226](https://github.com/edmundhung/maildog/commit/9688226db6b9530aff84671a8723a6096e3ae01f))
* **web:** prepare a default homepage for web authentication flow ([cbe752d](https://github.com/edmundhung/maildog/commit/cbe752d6304d9af2ae77b28d81e897139d8de689))
* **web:** the website should be mobile friendly ([e8c3eed](https://github.com/edmundhung/maildog/commit/e8c3eedf397e431cd75756cbb398ec499d0fb18c))

# [1.1.0](https://github.com/edmundhung/maildog/compare/v1.0.1...v1.1.0) (2021-07-15)


### Features

* add support of comment on the JSON config file with `jsonc` ([5bc1ebb](https://github.com/edmundhung/maildog/commit/5bc1ebbcf400ffe827cb4184181e7e7d77ac9b80)), closes [#7](https://github.com/edmundhung/maildog/issues/7)

## [1.0.1](https://github.com/edmundhung/maildog/compare/v1.0.0...v1.0.1) (2021-07-15)


### Bug Fixes

* ensure config work as stated on documentation ([7247342](https://github.com/edmundhung/maildog/commit/7247342778deb8b1f09e1415cd05f53bad7082d9)), closes [#12](https://github.com/edmundhung/maildog/issues/12)

# 1.0.0 (2021-07-11)


### Bug Fixes

* activate receipt rule set after deploy ([eeb2338](https://github.com/edmundhung/maildog/commit/eeb2338039303444b3e93368898f03a06790ba83))
* deleteMessageBatch fails due to access denied ([630e74b](https://github.com/edmundhung/maildog/commit/630e74b8d0d9fbaa5c056bd6763af62d71aedb6e))
* email could be silently dropped if allowPlusSign is set to false with no fallback email ([559b1b1](https://github.com/edmundhung/maildog/commit/559b1b16cfe728d17528e4f4eed14cb93948d076))
* ensure all aws usages are covered by the example-policy ([0fc9d52](https://github.com/edmundhung/maildog/commit/0fc9d5259daf60d58c525f58dc29a238c8f964d3))
* example config should be aligned with doc ([02bb46e](https://github.com/edmundhung/maildog/commit/02bb46ea341990c6dd4abeeb484f41fb560bc8ba))
* ignore config file for format checking ([665516d](https://github.com/edmundhung/maildog/commit/665516d195a0baa12d8d8dc7b9827dec91284997))
* semantic release does not works with signing tag ([9004bd0](https://github.com/edmundhung/maildog/commit/9004bd0f6addefaa14825021f592c9afaee0e9ee))
* ses should stop walking through the ruleset if alias match ([18fdbd6](https://github.com/edmundhung/maildog/commit/18fdbd68715f9c32270cd1e1b55d9313926dbcd7))


### Features

* add a destroy workflow to completely remove maildog from aws ([312ddb8](https://github.com/edmundhung/maildog/commit/312ddb8a77134cb411f62626a4e9a8d458863a9d))
* add experimental schedular lambda for redriving DLQ messages ([695ea14](https://github.com/edmundhung/maildog/commit/695ea147262044440e2620d577c04daf3f94b728))
* add regular health check based on alarm state ([da82d3e](https://github.com/edmundhung/maildog/commit/da82d3e827a5b7845c1ceace42ab15e371f9275e))
* config filename should be configurable ([17d0eca](https://github.com/edmundhung/maildog/commit/17d0ecaa0f0181c5ba5e48c4080a83787d0ebac0))
* disable default retry attempts on lambda functions ([795290d](https://github.com/edmundhung/maildog/commit/795290d62fcf16f5feb78d99accebc6b05e8b619))
* dispatcher should read bucket name and key prefix from event ([f2d8fe2](https://github.com/edmundhung/maildog/commit/f2d8fe21fe135af07612d8393b5aa7ecd5d26ffd))
* enable manual redrive through github action ([2adfd9f](https://github.com/edmundhung/maildog/commit/2adfd9fc824af7f45227748c6eb42af865ccc6e0))
* encrypt config and check into repo ([bddcc2a](https://github.com/edmundhung/maildog/commit/bddcc2a06f3e821cf3fa4c2152c04286b8b7f937))
* ensure the alarm treating missing data as not breaching ([d0ff264](https://github.com/edmundhung/maildog/commit/d0ff264e86f74fe0781c09cbf46db52006c95c85))
* ensure unmatched email to be caught by a domain level rule with bounce action ([bad2b06](https://github.com/edmundhung/maildog/commit/bad2b06ee90682930f671970f3692290c0a0a5e9))
* implement email forwarding based on aws-lambda-ses-forwarder ([99a3a0f](https://github.com/edmundhung/maildog/commit/99a3a0fea5c643a5426dc78d443be26c28920a13))
* merge validate and analyze workflow to one ([f752ec5](https://github.com/edmundhung/maildog/commit/f752ec5ccc1d8082c5ccc4192456d7fcb3dcd07a))
* redesign development workflow ([e8ad2f8](https://github.com/edmundhung/maildog/commit/e8ad2f852e4abf0272b5b5b440296ce56f7befaf))
* redesigned config structure ([c4a556c](https://github.com/edmundhung/maildog/commit/c4a556c97473cb583923fd177d058ae5046c3226))
* relax conventional commit requirements from git hook ([231c921](https://github.com/edmundhung/maildog/commit/231c921e1f57e4bf98473c688e513af7bbad1069))
* setup alarm for DLQ ([e67208f](https://github.com/edmundhung/maildog/commit/e67208f5718538fb690b2fbb5af732f4a8f1bc79))
* use sns to initiate dispatcher lambda function ([88a0d49](https://github.com/edmundhung/maildog/commit/88a0d49014caa78d5c506b6c7cc407b842015409))
