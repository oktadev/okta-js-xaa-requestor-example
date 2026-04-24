// Get the appropriate redirect URI based on environment
const CODESPACE_NAME = process.env.CODESPACE_NAME;

if (!CODESPACE_NAME) {
  console.log('Not running in a Codespace');
  console.log('REDIRECT_URI=http://localhost:3000/auth/callback');
  process.exit(0);
}

const redirectUri = `https://${CODESPACE_NAME}-3000.app.github.dev/auth/callback`;
console.log(`REDIRECT_URI=${redirectUri}`);
