import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getStorage } from 'firebase-admin/storage';

// Initialize Firebase Admin (server-side)
function createFirebaseAdminApp() {
  if (getApps().length > 0) {
    return getApps()[0];
  }

  const serviceAccount = {
    type: 'service_account',
    project_id: 'ai-language-tutor-55977',
    private_key_id: '7a05649f1cec46fb2d1ca365b72867899ae2988a',
    private_key: `-----BEGIN PRIVATE KEY-----
MIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQDCMEOvuA9P24Gi
6GMXxcR+VJg9VsWkN0Ejc/jbkJBE2BMNpocNqFp2iqaUbwVkFIYHeHOZ797xlkPW
bZ23HUuD7O4//Jc/SHjyis+DfXr85exFl3r8fTwNcCy5OU8kdCpKkEk2i/5JRckB
fzEeR687+oif/+opmbkfWqYG4XiOLzdDOEUFhfTtlCd0spUqUB+zsZUIprKVCwLo
jUvcXsR0M9w+WAoNkSxERg6zRGZjHivjGfoS3fxOWAOICdlfvqLd5R2565BTO3NV
hbcP1LM2dsiLi1bbOG8n8H3+hRktuO/it6MeCSu9SDIsRKafvt6LB4N/dE6zEz0A
cJZE9JotAgMBAAECggEAObBX82R1XA6EgS6TfbT5jmQ4RAS6u3HUzqD93dChI2qj
omsF9Sc+FLhVC4S978DvHloI0cMCkvfGmHXBJGy2Ce/Byc2S6zBvCfL1+gS1nFr7
6aK6XTchN4bLKo2dduFxzOv3bBaDySXLtL+iCnJWWzWvEAVZfdlWtztZVnL2OxrE
PSpG+yz9twHBhzlA4xrpbVTbQidJorHnwQgIcN/keTjt6bNLh+f3t9KuZN1hydWu
ZJqc7t/Fe0870xuOEpWD0vXT2ZTxG+3FtA1wjOe7nWwRkgxzPcVnS6iUL/jOMUAI
fPe0cKvIb75J99WeVEp/NB8Z1MPUAR1kCELRvy08ywKBgQDmrZjahCTlflOLI9N9
zZTxTqsz33sruYXZOZ5HBsoj9eRH1KpD8teYy6oMRvEXOX6XQOJgbJFILjQG+4b5
tEJESO1wfUX8SMEiZV5AiAJ3L1vCaTdDowCpxa3i2vTr3IpWmf5do2xVi0a1FGNb
hsAm7/2uMmw5GZ7C8+yedG4zRwKBgQDXgUFLktJEHXsGCERNboznWT8Yd7u7bTAz
5OmEOIb7Ag5mRaX/+DCOwpKUNaSDlyjbe2iUMWrhxuqwYVABXJyciFzGBgXgm6Du
r6uy57mCCU45sgmi1Yp+4sjUqFU/pwBHcjSfCXAwSlWrvlX10o1/8gAY38vLMPg7
aagiNMw46wKBgQCfx0qCwNkVpMSVMcGB9+3cntLy4S7dgGl3pvM82zUUZ3MxVdqB
qikvipJEYrcHkSlf9u9WPpz61BXxaDN7riHgTms4aW0abAJqorAAHrUmfMUgCeTf
kn4ZGfVxlpvi6yVfCtcnYNTfA9N8BZ00fkeGMOET0ZUoj9hpzK7uqlLSbQKBgHuD
z6K7AdyccPhiIJOouwWV9z3U0jp4OFpl5xkrNOIEqbAgVyZAX8RS7KQZorLxHi+9
qZDWSgYhdj2laK9/HxvwZAvzQ8caK8Dh2qztdzt6jeUvj6pObdSPsr9/w2x6EQTi
Bhro0+45jKSksKv2A7fDQh7/ldRdusiCpCUG0c4FAoGASqqHI1vY0UhrkXRRrsSA
69VIeULqNZMGaA2ipq2PGhsLyT42ROCgwpmRr6+TRNOz9kHfo159zOizeQLxrmHf
d92bh3KTYI998vkl/Im0tTKf+uBTTw7hlNxcBeOZEU3/pg9qdcLyjy88AEZSWl51
jaw39hRb7wvUsg2PTEbFqDw=
-----END PRIVATE KEY-----`,
    client_email:
      'firebase-adminsdk-4w7oe@ai-language-tutor-55977.iam.gserviceaccount.com',
    client_id: '110963035807555429822',
    auth_uri: 'https://accounts.google.com/o/oauth2/auth',
    token_uri: 'https://oauth2.googleapis.com/token',
    auth_provider_x509_cert_url: 'https://www.googleapis.com/oauth2/v1/certs',
    client_x509_cert_url:
      'https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-4w7oe%40ai-language-tutor-55977.iam.gserviceaccount.com',
    universe_domain: 'googleapis.com',
  };

  return initializeApp({
    credential: cert(serviceAccount),
    storageBucket: 'ai-language-tutor-55977.appspot.com', // Confirmed bucket name
  });
}

// Get Firebase Admin instances
const adminApp = createFirebaseAdminApp();
export const adminStorage = getStorage(adminApp);
export default adminApp;
