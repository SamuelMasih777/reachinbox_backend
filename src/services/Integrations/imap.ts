import Imap from 'imap';
import { simpleParser, AddressObject } from 'mailparser';
import emailService from '../emailService';
import { Readable } from 'stream';

interface ImapConfig {
    user: string;
    password: string;
    host: string;
    port: number;
    tls: boolean;
}

const accounts: ImapConfig[] = [
    {
        user: process.env.EMAIL1_USER!,
        password: process.env.EMAIL1_PASS!,
        host: process.env.EMAIL1_HOST!,
        port: Number(process.env.EMAIL1_PORT!),
        tls: true,
    },
    {
        user: process.env.EMAIL2_USER!,
        password: process.env.EMAIL2_PASS!,
        host: process.env.EMAIL2_HOST!,
        port: Number(process.env.EMAIL2_PORT!),
        tls: true,
    },
];

function extractAddresses(addressObj: AddressObject | AddressObject[] | undefined): string {
    if (!addressObj) return '';

    if (Array.isArray(addressObj)) {
        // If it's an array of AddressObject
        return addressObj.map(a => a.value.map(v => v.address).join(', ')).join(', ');
    }

    // If it's a single AddressObject
    return addressObj.value.map(v => v.address).join(', ');
}

function startImap(account: ImapConfig) {
    const imap = new Imap({
        user: account.user,
        password: account.password,
        host: account.host,
        port: account.port,
        tls: account.tls,
    });

    function openInbox(cb: any) {
        imap.openBox('INBOX', false, cb);
    }

    imap.once('ready', function () {
        console.log(`✅ IMAP Ready: ${account.user}`);
        openInbox(function (err: any, box: any) {
            if (err) throw err;

            console.log(`📥 Listening for emails in: ${box.name} for ${account.user}`);

            // Initial fetch (optional, can be used to backfill emails)
            fetchUnseenEmails(account, box.name);

            // Real-time listener
            imap.on('mail', function () {
                console.log('📩 New mail detected!');
                fetchUnseenEmails(account, box.name);
            });
        });
    });

    imap.once('error', function (err: any) {
        console.log(`❌ IMAP Error for ${account.user}:`, err);
    });

    imap.once('end', function () {
        console.log(`❗ IMAP Connection ended for ${account.user}`);
        // Optional: Reconnect logic can be implemented here
    });

    imap.connect();
}

function fetchUnseenEmails(account: ImapConfig, folder: string) {
    const imap = new Imap({
        user: account.user,
        password: account.password,
        host: account.host,
        port: account.port,
        tls: account.tls,
    });

    imap.once('ready', () => {
        imap.openBox(folder, false, (err, box) => {
            if (err) throw err;

            imap.search(['UNSEEN'], (err, results) => {
                if (err || !results || results.length === 0) {
                    imap.end();
                    return;
                }

                const f = imap.fetch(results, { bodies: '' });

                f.on('message', function (msg) {
                    msg.on('body', function (stream: Readable) {
                        simpleParser(stream, async (err, parsed) => {
                            if (err) return;

                            const email = {
                                subject: parsed.subject,
                                from: extractAddresses(parsed.from),
                                to: extractAddresses(parsed.to),
                                date: parsed.date,
                                body: parsed.text,
                                account: account.user,
                                folder,
                            };

                            console.log(`📥 Storing email from ${email.from} with subject "${email.subject}"`);
                            await emailService.storeEmail(email);
                        });
                    });
                });

                f.once('end', () => {
                    imap.end();
                });
            });
        });
    });

    imap.once('error', (err: any) => {
        console.error('Fetch IMAP Error:', err);
        if (err.source === 'timeout-auth') {
        console.log(`Retrying IMAP connection for ${account.user}...`);
        setTimeout(() => startImap(account), 5000);
    }
    });

    imap.connect();
}

export function startAllImap() {
    accounts.forEach(account => startImap(account));
}
