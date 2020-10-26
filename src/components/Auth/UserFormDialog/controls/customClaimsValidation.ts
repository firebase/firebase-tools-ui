// This assert is not exported and is intentionally inconsistent with the rest of the app.
function assert(assertion: unknown, error: string): asserts assertion {
  if (!assertion) {
    throw new Error(error);
  }
}

const BadRequestError = Error;

/**
 * The code below has been copy-pasted from firebase-tools repo as is.
 * https://github.com/firebase/firebase-tools/blob/14977a2df4f046c6439167e9037373363db648a2/src/emulator/auth/operations.ts#L1350
 */
const CUSTOM_ATTRIBUTES_MAX_LENGTH = 1000;

export function validateSerializedCustomClaims(claims: string): void {
  assert(claims.length <= CUSTOM_ATTRIBUTES_MAX_LENGTH, 'CLAIMS_TOO_LARGE');

  let parsed;
  try {
    parsed = JSON.parse(claims);
  } catch {
    throw new BadRequestError('INVALID_CLAIMS');
  }
  validateCustomClaims(parsed);
}

// https://firebase.google.com/docs/auth/admin/create-custom-tokens#create_custom_tokens_using_the_firebase_admin_sdk
const FORBIDDEN_CUSTOM_CLAIMS = [
  'iss',
  'aud',
  'sub',
  'iat',
  'exp',
  'nbf',
  'jti',
  'nonce',
  'azp',
  'acr',
  'amr',
  'cnf',
  'auth_time',
  'firebase',
  'at_hash',
  'c_hash',
];

function validateCustomClaims(
  claims: unknown
): asserts claims is Record<string, unknown> {
  // Only JSON objects (maps) are valid. Others are not.
  assert(
    typeof claims === 'object' && claims != null && !Array.isArray(claims),
    'INVALID_CLAIMS'
  );
  for (const reservedField of FORBIDDEN_CUSTOM_CLAIMS) {
    assert(!(reservedField in claims), `FORBIDDEN_CLAIM : ${reservedField}`);
  }
}
