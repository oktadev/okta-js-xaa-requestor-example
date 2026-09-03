# NestJS Cross App Access (XAA) Requestor App Example

This repository contains a working example of a NestJS web app that requests resources from a third-party app within a trust domain using the [xaa.dev](https://xaa.dev) testing site. Please read [Make Secure App-to-App Connections Using Cross App Access][blog] for a detailed guide through.

**Required tools**
 * [Node.js](https://nodejs.org/en) v22 LTS. 
   There is a known issue with Node v24. See https://github.com/nodejs/corepack/issues/813
 * Command-line terminal application
 * A code editor/Integrated development environment (IDE), such as [Visual Studio Code](https://code.visualstudio.com/) (VS Code)
 * [Git](https://git-scm.com/)


- [NestJS Cross App Access (XAA) Requestor App Example](#nestjs-cross-app-access-xaa-requestor-app-example)
  - [Getting Started](#getting-started)
    - [Register a Client App in xaa.dev site](#register-a-client-app-in-xaadev-site)
    - [Using with GitHub Codespaces](#using-with-github-codespaces)
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

Save your `CLIENT_ID`, `CLIENT_SECRET`, `RESOURCE_CLIENT_ID`, and `RESOURCE_CLIENT_SECRET` as values within the `.env` file. 
Double check that the defined URL for the IDP, auth server, and todo resource server.

### Using with GitHub Codespaces

When running this app in GitHub Codespaces, you need to update the `REDIRECT_URI` in your `.env` file to use the Codespaces URL instead of localhost.

**Automatic approach (recommended):**

Run the following command to get the correct redirect URI:
```sh
npm run get-redirect-uri
```

This will output the appropriate URI—either the Codespace URL (if running in a Codespace) or the localhost URL (if running locally). Copy the output and set it in your `.env` file.

**Manual approach:**

**Finding your Codespaces URL:**
- Look at the URL in your browser while using the Codespace. It will be in the format: `https://<codespace-name>.app.github.dev`
- Alternatively, find the Codespace name in the VS Code Remote indicator in the bottom-left corner

**Update the REDIRECT_URI** to:
```
REDIRECT_URI=https://<codespace-name>-3000.app.github.dev/auth/callback
```

Replace `<codespace-name>` with your actual Codespace name (for example: `amusing-sniffle-w7g699`).

Then, update the `REDIRECT_URI` in your client application registration on the [xaa.dev site](https://xaa.dev/developer/register) to match this new URL.

Serve the app

```sh
npm start
```

When the app starts, it will log the URL to navigate to in the console:
- **GitHub Codespaces**: `https://<codespace-name>-3000.app.github.dev`
- **Local development**: `http://localhost:3000`

Navigate to the URL shown in the console to view the app. 

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

