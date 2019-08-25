/*
This code is a bit refactored code from Google Youtube DATA API example:
https://developers.google.com/youtube/v3/quickstart/nodejs
 */
import { promisify } from 'util';
import { Credentials, GetTokenOptions, OAuth2Client } from 'google-auth-library';
import * as fs from 'fs';
import * as readline from 'readline';
import { google } from 'googleapis';

const { OAuth2 } = google.auth;
const readFileAsync = promisify(fs.readFile);

// If modifying these scopes, delete your previously saved credentials
// at ~/.credentials/youtube-nodejs-quickstart.json
const SCOPES = ['https://www.googleapis.com/auth/youtube.readonly'];
const TOKEN_DIR = `${__dirname}\\.credentials\\`;
const TOKEN_PATH = `${TOKEN_DIR}youtube-nodejs-quickstart.json`;

type InstalledSecretContent = {
  'client_id': string,
  'project_id': string,
  'auth_uri': string,
  'token_uri': string,
  'auth_provider_x509_cert_url': string,
  'client_secret': string,
  'redirect_uris': string[],
};

type SecretContent = {
  installed: InstalledSecretContent,
};

async function readClientSecret(path: string):Promise<SecretContent> {
  try {
    const content: any = await readFileAsync(path);
    return JSON.parse(content);
  } catch (error) {
    console.log(`Error loading client secret file: ${error}`);
    throw error;
  }
}


async function storeToken(token: Credentials): Promise<void> {
  try {
    fs.mkdirSync(TOKEN_DIR);
  } catch (err) {
    if (err.code !== 'EEXIST') {
      throw err;
    }
  }

  const writeFileAsync = promisify(fs.writeFile);
  await writeFileAsync(TOKEN_PATH, JSON.stringify(token));
  console.log(`Token stored to ${TOKEN_PATH}`);
}


async function getNewToken(oauth2Client: OAuth2Client): Promise<void> {
  const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
  });
  console.log('Authorize this app by visiting this url: ', authUrl);


  // const questionAsync = promisify(rl.question);
  const questionAsync = async (query: string): Promise<GetTokenOptions> => new Promise(resolve => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });
    rl.question(query, (code: any) => {
      rl.close();
      resolve(code);
    });
  });

  const code: GetTokenOptions = await questionAsync('Enter the code from that page here: ');

  const token: Credentials = (await oauth2Client.getToken(code)).tokens;

  // eslint-disable-next-line no-param-reassign
  oauth2Client.credentials = token;
  await storeToken(token);
}

async function authorize(secretContent: SecretContent): Promise<OAuth2Client> {
  const clientSecret = secretContent.installed.client_secret;
  const clientId = secretContent.installed.client_id;
  const redirectUrl = secretContent.installed.redirect_uris[0];
  const oauth2Client = new OAuth2(clientId, clientSecret, redirectUrl);

  let token = '';

  try {
    token = (await readFileAsync(TOKEN_PATH)).toString();
    oauth2Client.credentials = JSON.parse(token);
  } catch (error) {
    await getNewToken(oauth2Client);
  }
  return oauth2Client;
}

(async () => {
  const secret: SecretContent = await readClientSecret('client_secret.json');
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const oauth2Client: OAuth2Client = await authorize(secret);
})();
