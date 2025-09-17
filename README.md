![](./public/full-logo.png)

**INF Auth** is a local-first authentication controller that allows users to securely log in via multiple OAuth providers. Tokens for third-party services (Google, Telegram, etc.) are stored only on the user’s device, keeping sensitive data out of servers. Users can rebind accounts if a provider is compromised, maintaining control over their logins.

INF Auth is mostly functional locally. A minimal backend and OAuth provider functionality are still in progress. Future plans include encrypting local tokens with a master key using Argon2.

## TODO

* [ ] Implement minimal backend for developer integration and settings.
* [ ] Complete OAuth provider integration.
* [ ] Add master-key encryption for local tokens (Argon2).
* [ ] Add secure import/export of local token data.
* [ ] Write developer documentation.
* [ ] Implement notifications for potentially compromised tokens.
* [ ] One-time and temporary tokens for anonymous authorization.
* [ ] Creation of a single, averaged user profile using authorized accounts, which will be issued upon authorization to the site.
