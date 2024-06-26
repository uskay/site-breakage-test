# site-breakage-test (v0.1.0 ― a WIP prototype)

A demo site to understand how [third-party cookie deprecation (3PCD)](https://developers.google.com/privacy-sandbox/3pcd) impacts sites.

## Get started

```
git clone https://github.com/uskay/site-breakage-test.git
npm install
```

The demo has two modes.

1. A mode with breakages when the browser opts-in to 3PCD
```
npm run server
```

2. A mode that applies fixes for the breakages
```
npm run server-3pcdfix
```

Try it out using a fresh new Chrome profile with the options below:
- 3PCD enviroment

```
/Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome --disable-sync --no-default-browser-check --no-first-run --start-maximized --user-data-dir="$(mktemp -d '/tmp/chrome_data_dir.XXXXXXXXXX')" --silent-debugger-extension-api --ignore-certificate-errors  --install-autogenerated-theme='150,220,150'  --test-third-party-cookie-phaseout --enable-features="FirstPartySets,StorageAccessAPI,StorageAccessAPIForOriginExtension,PageInfoCookiesSubpage,PrivacySandboxFirstPartySetsUI,TpcdMetadataGrants,TpcdSupportSettings,TpcdHeuristicsGrants:TpcdReadHeuristicsGrants/true/TpcdWritePopupCurrentInteractionHeuristicsGrants/30d/TpcdBackfillPopupHeuristicsGrants/30d/TpcdPopupHeuristicEnableForIframeInitiator/all/TpcdWriteRedirectHeuristicGrants/15m/TpcdRedirectHeuristicRequireABAFlow/true/TpcdRedirectHeuristicRequireCurrentInteraction/true"
```

- 3P cookie enabled enviroment

```
/Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome --disable-sync --no-default-browser-check --no-first-run --start-maximized --user-data-dir="$(mktemp -d '/tmp/chrome_data_dir.XXXXXXXXXX')" --silent-debugger-extension-api --ignore-certificate-errors  --install-autogenerated-theme='255,51,51'
```

> Since the demo uses self-signed TLS certificates, the command line option above includes `--ignore-certificate-errors`.

> Reference: https://raw.githubusercontent.com/GoogleChromeLabs/ps-analysis-tool/main/bin/chrome_launcher.sh

Also, modify your `hosts` file to use multiple https domains locally for testing purposes.
```
127.0.0.1       test-ecomm-site.com
127.0.0.1       test-another-site.com
127.0.0.1       test-chat.com
127.0.0.1       test-payments.com
127.0.0.1       my-site-tracker.com
127.0.0.1       some-third-party-tracker.com
```
## User journey
### Original user jouney with 3P cookies enabled
Everything works beautifully with 3P cookies.

![Snippet](https://cdn.glitch.global/d1d49b49-541b-4e26-8cd5-f7fa3a45e1aa/Screenshot%202024-05-17%20at%2015.24.43.png?v=1715927093096)

Comprehensive user journey details accessible here: [Link to slides](https://docs.google.com/presentation/d/e/2PACX-1vQBl7SyHV3J_fu9JhRk9sMvu3ayV1guSnenFR8hliTpMA_bk6YAeumPs2nCkB122X8Ysoo1B61SWINz/pub?start=false&loop=false&delayms=3000)

### When using a 3PCD environment
Things start to break when 3P cookies gets disabled.

![Snippet](https://cdn.glitch.global/d1d49b49-541b-4e26-8cd5-f7fa3a45e1aa/Screenshot%202024-05-17%20at%2015.47.36.png?v=1715928481915)
Comprehensive breakage details accessible here: [Link to slides](https://docs.google.com/presentation/d/e/2PACX-1vQBl7SyHV3J_fu9JhRk9sMvu3ayV1guSnenFR8hliTpMA_bk6YAeumPs2nCkB122X8Ysoo1B61SWINz/pub?start=false&loop=false&delayms=3000#slide=id.g2ddcd3e2fe5_0_117)

## How to fix
1. Trackers
- For the trackers that can be considered as same business entity as the site, consider [Releated Website Sets](https://developers.google.com/privacy-sandbox/3pcd/related-website-sets). In this case, `https://my-site-tracker.com/track` can be added to RWS.
- For pure 3P trackers, there is no way of tracking users across sites after 3PCD. In this case, `https://some-third-party-tracker.com/track` would not work (which is WAI for Chrome).

2. Chat widget
- Considering the chat widget functional requirements, it would be mandatory to stitch session across pages under a same site but it might not be necessary to do that for cross sites.
- If that was the case, [CHIPS (Cookies Having Independent Partitioned State)](https://developers.google.com/privacy-sandbox/3pcd/chips) will solve the issue.

![Snippet](https://cdn.glitch.global/d1d49b49-541b-4e26-8cd5-f7fa3a45e1aa/Screenshot%202024-05-17%20at%2015.59.47.png?v=1715929199245)

3. Payment widget
- We'd ideally want this payment widget to work consistently across sites keeping the user data for easier & faster payments (no one likes to repeatedly input their payment information over and over again!).
- Since the widget is working as an iframe, [Storage Access API](https://developers.google.com/privacy-sandbox/3pcd/storage-access-api) will solve this. It will let the 3P iframe access its own 3P cookie. The caveat is that A) user needs to explicity allow the widget to access its cookie by consenting via a system prompt dialog which requires user gesture, B) with the prerequisite of the user directly accessing the embedded site as a top level window and C) if the user declines, the API won't work for (TODO: need to check its spec & the Chrome implementation).

![Snippet](https://cdn.glitch.global/d1d49b49-541b-4e26-8cd5-f7fa3a45e1aa/Screenshot%202024-05-17%20at%2016.20.31.png?v=1715930448796)

## Disclaimer
This code base is built for demo purpose only (non production ready code). Please reference as one of the examples to understand what site breakages could look like.

---

License Apache-2.0
