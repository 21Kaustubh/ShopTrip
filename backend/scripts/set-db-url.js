// Non-echoing terminal input to safely set DATABASE_URL in backend/.env
const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '..', '.env');

/**
 * Strips ANSI escape sequences (e.g. bracketed paste markers \x1b[200~ and \x1b[201~).
 */
function stripAnsi(str) {
  if (!str || typeof str !== 'string') return '';
  return str.replace(/\x1b\[[0-9;?]*[a-zA-Z~]/g, '');
}

/**
 * Cleans and normalizes a pasted or typed connection string.
 * - Strips ANSI escape codes from bracketed paste mode in modern terminals.
 * - Strips non-printable control characters.
 * - Trims surrounding whitespace.
 * - Strips optional variable prefixes (e.g. DATABASE_URL= or export DATABASE_URL=).
 * - Removes a single pair of surrounding double, single, or backtick quotes.
 */
function cleanUrl(raw) {
  if (!raw || typeof raw !== 'string') return '';

  // 1. Remove ANSI escape sequences (e.g. bracketed paste \x1b[200~ ... \x1b[201~)
  let val = stripAnsi(raw);

  // 2. Remove non-printable control characters (except standard whitespace handled by trim)
  val = val.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');

  // 3. Trim whitespace
  val = val.trim();

  // 4. Strip optional variable prefix if copied from a .env file or export statement
  val = val.replace(/^(?:export\s+)?DATABASE_URL\s*=\s*/i, '').trim();

  // 5. Remove a single pair of surrounding quotes if present
  if (
    (val.startsWith('"') && val.endsWith('"') && val.length >= 2) ||
    (val.startsWith("'") && val.endsWith("'") && val.length >= 2) ||
    (val.startsWith('`') && val.endsWith('`') && val.length >= 2)
  ) {
    val = val.slice(1, -1).trim();
  }

  return val;
}

/**
 * Validates that the URL uses the PostgreSQL protocol.
 */
function isValidPostgresUrl(val) {
  return (
    typeof val === 'string' &&
    (val.startsWith('postgresql://') || val.startsWith('postgres://'))
  );
}

/**
 * Checks if backend/.env currently contains a non-placeholder valid database URL.
 */
function hasValidExistingUrl() {
  if (!fs.existsSync(envPath)) return false;
  const content = fs.readFileSync(envPath, 'utf8');
  const match = content.match(/^DATABASE_URL=(.+)$/m);
  if (!match) return false;
  const existing = cleanUrl(match[1]);
  return isValidPostgresUrl(existing) && !existing.includes('PASTE_YOUR_NEON');
}

/**
 * Saves the cleaned database URL into backend/.env, preserving all other variables.
 */
function saveConnection(rawInput) {
  const val = cleanUrl(rawInput);

  if (!isValidPostgresUrl(val)) {
    console.error(
      'Error: Invalid format. Connection string must begin with postgresql:// or postgres://'
    );
    process.exit(1);
  }

  if (!fs.existsSync(envPath)) {
    console.error('Error: backend/.env not found at ' + envPath);
    process.exit(1);
  }

  const lines = fs.readFileSync(envPath, 'utf8').split(/\r?\n/);
  let found = false;
  const newLines = lines.map((line) => {
    if (/^DATABASE_URL=/.test(line)) {
      found = true;
      return `DATABASE_URL="${val}"`;
    }
    return line;
  });

  if (!found) {
    newLines.push(`DATABASE_URL="${val}"`);
  }

  fs.writeFileSync(envPath, newLines.join('\n'), 'utf8');
  console.log('Success: DATABASE_URL saved securely to backend/.env.');
}

/**
 * Prompts the user to enter the database URL with masked input.
 */
function promptDatabaseUrl() {
  process.stdout.write(
    'Enter Neon PostgreSQL connection string (input will be masked): '
  );

  let inputBuffer = '';

  if (process.stdin.isTTY) {
    process.stdin.setRawMode(true);
    process.stdin.resume();
    process.stdin.setEncoding('utf8');

    process.stdin.on('data', (chunk) => {
      // Handle Ctrl+C
      if (chunk.includes('\u0003')) {
        process.stdout.write('\nCancelled.\n');
        process.exit(0);
      }

      // Check if chunk contains Enter / Return / EOF
      const newlineIndex = chunk.search(/[\r\n\u0004]/);
      if (newlineIndex !== -1) {
        const beforeNewline = chunk.slice(0, newlineIndex);
        inputBuffer += beforeNewline;
        const printableCount = stripAnsi(beforeNewline).replace(/[\x00-\x1F\x7F]/g, '').length;
        if (printableCount > 0) {
          process.stdout.write('*'.repeat(printableCount));
        }

        process.stdin.setRawMode(false);
        process.stdin.pause();
        process.stdout.write('\n');
        saveConnection(inputBuffer);
        return;
      }

      // Handle Backspace
      if (chunk === '\b' || chunk === '\x7f') {
        if (inputBuffer.length > 0) {
          inputBuffer = inputBuffer.slice(0, -1);
          process.stdout.write('\b \b');
        }
        return;
      }

      // Normal characters or pasted chunk
      inputBuffer += chunk;
      const printableCount = stripAnsi(chunk).replace(/[\x00-\x1F\x7F]/g, '').length;
      if (printableCount > 0) {
        process.stdout.write('*'.repeat(printableCount));
      }
    });
  } else {
    // Non-TTY piped input fallback
    let raw = '';
    process.stdin.setEncoding('utf8');
    process.stdin.on('data', (chunk) => {
      raw += chunk;
    });
    process.stdin.on('end', () => {
      saveConnection(raw);
    });
  }
}

/**
 * Main entry point. Confirms overwrite if a valid URL already exists.
 */
function run() {
  if (!fs.existsSync(envPath)) {
    console.error('Error: backend/.env not found at ' + envPath);
    process.exit(1);
  }

  if (hasValidExistingUrl() && process.stdin.isTTY) {
    process.stdout.write(
      'A valid DATABASE_URL is already configured in backend/.env. Overwrite? (y/N): '
    );
    process.stdin.setRawMode(true);
    process.stdin.resume();
    process.stdin.setEncoding('utf8');

    const onConfirmData = (chunk) => {
      process.stdin.removeListener('data', onConfirmData);
      process.stdin.setRawMode(false);
      process.stdin.pause();

      if (chunk.toLowerCase().startsWith('y')) {
        process.stdout.write('y\n');
        promptDatabaseUrl();
      } else {
        process.stdout.write('\nOperation cancelled. Existing DATABASE_URL was preserved.\n');
        process.exit(0);
      }
    };

    process.stdin.on('data', onConfirmData);
  } else {
    promptDatabaseUrl();
  }
}

if (require.main === module) {
  run();
}

module.exports = {
  cleanUrl,
  isValidPostgresUrl,
  stripAnsi,
  hasValidExistingUrl,
  saveConnection,
};
