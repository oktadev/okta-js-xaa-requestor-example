# NestJS Cross App Access (XAA) Requestor App Example

This repository contains a working example of a NestJS web app that requests resources from a third-party app within a trust domain using the [xaa.dev](https://xaa.dev) testing site. Please read [Make Secure App-to-App Connections Using Cross App Access][blog] for a detailed guide through.

**Required tools**
 * [Node.js](https://nodejs.org/en) LTS version (v22 or higher at the time of this post)
 * Command-line terminal application
 * A code editor/Integrated development environment (IDE), such as [Visual Studio Code](https://code.visualstudio.com/) (VS Code)
 * [Git](https://git-scm.com/)


- [NestJS Cross App Access (XAA) Requestor App Example](#nestjs-cross-app-access-xaa-requestor-app-example)
  - [Getting Started](#getting-started)
    - [Register a Client App in xaa.dev site](#register-a-client-app-in-xaadev-site)
  - [Links](#links)
  - [Help](#help)
  - [License](#license)

## Getting Started

To run this example, run the following commands:

```sh
git clone https://github.com/oktadev/okta-nestjs-xaa-requestor-example.git
cd okta-nestjs-xaa-requestor-example
npm ci
```

### Register a Client App in xaa.dev site

Register a client application that uses xaa.dev's Identity Provider (IdP) and resource app by following the instructions on the [Client Registration](https://xaa.dev/developer/register) page.

Duplicate the `.env.example` file and rename it to `.env`.

Save your `client_id` and `client_secret` as values within the `.env` file.
Double check that the defined URL for the IDP, auth server, and todo resource server.

Serve the app

```sh
npm start
```

Navigate to `localhost:3000` to view the app. 

You'll see logging of the token exchange in the console and a list of todos in a side panel after authenticating.

## Links

This example uses the following OAuth specs and resources:

* [Identity Assertion JWT Authorization Grant](https://drafts.oauth.net/oauth-identity-assertion-authz-grant/draft-ietf-oauth-identity-assertion-authz-grant.html)
* [xaa.dev](https://xaa.dev/)
* [openid-client](https://github.com/panva/openid-client)

## Help

Please post any questions as comments on the [blog post][blog], or visit our [Okta Developer Forums](https://devforum.okta.com/).

## License

Apache 2.0, see [LICENSE](LICENSE).

[blog]: https://developer.okta.com/blog/2026/02/10/xaa-client

