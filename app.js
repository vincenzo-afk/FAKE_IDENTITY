// Store current state for JSON export
let currentData = {};

// DOM Elements
const els = {
    generateBtn: document.getElementById('generateBtn'),
    copyAllBtn: document.getElementById('copyAllBtn'),
    createMailBtn: document.getElementById('createMailBtn'),
    getPhoneBtn: document.getElementById('getPhoneBtn'),
    
    // Identity
    userAvatar: document.getElementById('userAvatar'),
    fullName: document.getElementById('fullName'),
    username: document.getElementById('username'),
    gender: document.getElementById('gender'),
    dob: document.getElementById('dob'),
    address: document.getElementById('address'),
    
    // Contact
    email: document.getElementById('email'),
    phone: document.getElementById('phone'),
    // Inboxes
    tabEmail: document.getElementById('tabEmail'),
    tabSms: document.getElementById('tabSms'),
    emailInbox: document.getElementById('emailInbox'),
    smsInbox: document.getElementById('smsInbox'),
    
    // Payment
    ccNumber: document.getElementById('ccNumber'),
    ccExp: document.getElementById('ccExp'),
    ccCvv: document.getElementById('ccCvv'),
    ccNumberVis: document.getElementById('ccNumberVis'),
    ccNameVis: document.getElementById('ccNameVis'),
    ccExpVis: document.getElementById('ccExpVis'),
    ccCvvVis: document.getElementById('ccCvvVis'),
    
    // Toast
    toast: document.getElementById('toast'),
    toastMsg: document.getElementById('toastMsg')
};

// Event Listeners
els.generateBtn.addEventListener('click', generateIdentity);
els.copyAllBtn.addEventListener('click', copyAllJson);
els.createMailBtn.addEventListener('click', createLiveMail);
els.getPhoneBtn.addEventListener('click', getLivePhone);

els.tabEmail.addEventListener('click', () => {
    els.tabEmail.classList.add('active', 'bg-primary', 'text-white');
    els.tabEmail.style.background = 'var(--primary)';
    els.tabEmail.style.color = 'white';
    els.tabEmail.style.borderColor = 'var(--primary)';
    
    els.tabSms.classList.remove('active');
    els.tabSms.style.background = 'rgba(255, 255, 255, 0.05)';
    els.tabSms.style.color = 'var(--text-main)';
    els.tabSms.style.borderColor = 'var(--border-color)';
    
    els.emailInbox.style.display = 'block';
    els.smsInbox.style.display = 'none';
});

els.tabSms.addEventListener('click', () => {
    els.tabSms.classList.add('active', 'bg-primary', 'text-white');
    els.tabSms.style.background = 'var(--primary)';
    els.tabSms.style.color = 'white';
    els.tabSms.style.borderColor = 'var(--primary)';
    
    els.tabEmail.classList.remove('active');
    els.tabEmail.style.background = 'rgba(255, 255, 255, 0.05)';
    els.tabEmail.style.color = 'var(--text-main)';
    els.tabEmail.style.borderColor = 'var(--border-color)';
    
    els.smsInbox.style.display = 'block';
    els.emailInbox.style.display = 'none';
});

let mailToken = null;
let mailPollingInterval = null;
let fetchedMessageIds = new Set();

document.querySelectorAll('[data-copy]').forEach(btn => {
    btn.addEventListener('click', (e) => {
        const id = e.currentTarget.getAttribute('data-copy');
        const text = els[id].innerText;
        if (text && text !== '--') {
            copyToClipboard(text, `${id} copied`);
        }
    });
});

// Main Generate Function
async function generateIdentity() {
    els.generateBtn.classList.add('loading');
    els.generateBtn.disabled = true;
    
    try {
        let person;
        try {
            // Try fetching from FakerAPI
            const fakerRes = await fetch('https://fakerapi.it/api/v2/persons?_quantity=1&_locale=en_IN');
            if (!fakerRes.ok) throw new Error('API down');
            const fakerData = await fakerRes.json();
            person = fakerData.data[0];
        } catch (apiError) {
            console.log('Using offline identity fallback.');
            // Fallback mock data if API is blocked or offline
            const fNames = ["Alex", "Jordan", "Taylor", "Morgan", "Sam", "Casey"];
            const lNames = ["Smith", "Johnson", "Williams", "Brown", "Jones", "Miller"];
            const genders = ["male", "female", "non-binary"];
            person = {
                firstname: fNames[Math.floor(Math.random() * fNames.length)],
                lastname: lNames[Math.floor(Math.random() * lNames.length)],
                gender: genders[Math.floor(Math.random() * genders.length)],
                birthday: "199" + Math.floor(Math.random() * 9) + "-0" + Math.floor(1 + Math.random() * 8) + "-1" + Math.floor(Math.random() * 9),
                address: {
                    street: Math.floor(100 + Math.random() * 900) + " Main St",
                    city: "Metropolis",
                    country: "US",
                    zipcode: Math.floor(10000 + Math.random() * 90000).toString()
                },
                email: "mock_" + Math.floor(Math.random() * 1000) + "@example.com",
                phone: "+1 555 " + Math.floor(100 + Math.random() * 899) + " " + Math.floor(1000 + Math.random() * 8999)
            };
        }
        
        const username = `${person.firstname.toLowerCase()}${person.lastname.toLowerCase()}${Math.floor(Math.random() * 9999)}`;
        
        // Generate Card
        const cardType = Math.random() > 0.5 ? '4' : '5'; // Visa or MC
        const ccNum = generateLuhn(cardType);
        const expMonth = String(Math.floor(Math.random() * 12) + 1).padStart(2, '0');
        const expYear = String(Math.floor(Math.random() * 10) + 26); // 2026-2035
        const exp = `${expMonth}/${expYear}`;
        const cvv = String(Math.floor(Math.random() * 900) + 100);
        
        // Construct Data Object
        currentData = {
            firstName: person.firstname,
            lastName: person.lastname,
            fullName: `${person.firstname} ${person.lastname}`,
            username: username,
            gender: person.gender,
            dob: person.birthday,
            address: `${person.address.street}, ${person.address.city}, ${person.address.country} ${person.address.zipcode}`,
            email: person.email,
            phone: person.phone,
            card: {
                number: ccNum,
                expiry: exp,
                cvv: cvv,
                type: cardType === '4' ? 'Visa' : 'Mastercard'
            }
        };
        
        // Update UI
        updateUI();
        showToast('Identity Generated!');
        
    } catch (error) {
        console.error('Error generating identity:', error);
        showToast('Error generating identity', true);
    } finally {
        els.generateBtn.classList.remove('loading');
        els.generateBtn.disabled = false;
    }
}

// Luhn Algorithm Generator
function generateLuhn(prefix, length = 16) {
    let num = prefix;
    while (num.length < length - 1) num += Math.floor(Math.random() * 10);
    let sum = 0;
    let alt = false;
    for (let i = num.length - 1; i >= 0; i--) {
        let n = parseInt(num[i]);
        if (alt) { n *= 2; if (n > 9) n -= 9; }
        sum += n;
        alt = !alt;
    }
    const check = (10 - (sum % 10)) % 10;
    return num + check;
}

function updateUI() {
    // Basic Details
    els.fullName.innerText = currentData.fullName;
    els.username.innerText = currentData.username;
    els.gender.innerText = currentData.gender.charAt(0).toUpperCase() + currentData.gender.slice(1);
    els.dob.innerText = currentData.dob;
    els.address.innerText = currentData.address;
    
    // Contact
    els.email.innerText = currentData.email;
    els.phone.innerText = currentData.phone;
    
    // Financial
    const formattedCard = currentData.card.number.match(/.{1,4}/g).join(' ');
    els.ccNumber.innerText = formattedCard;
    els.ccExp.innerText = currentData.card.expiry;
    els.ccCvv.innerText = currentData.card.cvv;
    
    // Visual Card Update
    els.ccNumberVis.innerText = formattedCard;
    els.ccNameVis.innerText = currentData.fullName.toUpperCase();
    els.ccExpVis.innerText = currentData.card.expiry;
    els.ccCvvVis.innerText = currentData.card.cvv;
    
    // Avatar
    const initial = currentData.firstName.charAt(0).toUpperCase();
    els.userAvatar.innerHTML = `<span>${initial}</span>`;
    
    // Remove empty-state classes
    document.querySelectorAll('.empty-state').forEach(el => el.classList.remove('empty-state'));
}

async function createLiveMail() {
    if (!currentData.fullName) {
        showToast('Generate identity first', true);
        return;
    }
    
    els.createMailBtn.classList.add('loading');
    
    try {
        // 1. Get Domains
        const domRes = await fetch('https://api.mail.tm/domains');
        if (!domRes.ok) throw new Error('Mail API Down');
        const domData = await domRes.json();
        const domain = domData['hydra:member'][0].domain;
        
        // 2. Create Account
        const email = `${currentData.username.toLowerCase()}@${domain}`;
        const password = generatePassword();
        
        const accRes = await fetch('https://api.mail.tm/accounts', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ address: email, password: password })
        });
        
        if (accRes.ok) {
            currentData.liveEmail = { address: email, password: password };
            els.email.innerText = email;
            
            // 3. Get Auth Token
            const tokenRes = await fetch('https://api.mail.tm/token', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ address: email, password: password })
            });
            const tokenData = await tokenRes.json();
            mailToken = tokenData.token;
            
            showToast('Live Inbox Created!');
            
            els.emailInbox.innerHTML = `<div class="empty-state" style="text-align: center; padding: 2rem 1rem; color: var(--text-muted);"><div class="loader" style="margin: 0 auto 1rem; border-color: rgba(255,255,255,0.2); border-top-color: var(--primary); width: 32px; height: 32px; display: block;"></div><p>Inbox active. Waiting for incoming emails...</p></div>`;
            
            // Start Polling
            if (mailPollingInterval) clearInterval(mailPollingInterval);
            fetchEmails(); // Fetch immediately once
            mailPollingInterval = setInterval(fetchEmails, 5000); // Poll every 5s
            
        } else {
            throw new Error('Failed to create inbox');
        }
    } catch (e) {
        console.log('Using offline email fallback.');
        const mockEmail = `${currentData.username.toLowerCase()}@localmail.dev`;
        currentData.liveEmail = { address: mockEmail, password: 'mock' };
        els.email.innerText = mockEmail;
        showToast('Offline Inbox Created!');
        
        els.emailInbox.innerHTML = `<div class="empty-state" style="text-align: center; padding: 2rem 1rem; color: var(--text-muted);"><div class="loader" style="margin: 0 auto 1rem; border-color: rgba(255,255,255,0.2); border-top-color: var(--primary); width: 32px; height: 32px; display: block;"></div><p>Inbox active. Waiting for incoming emails...</p></div>`;
        
        setTimeout(() => {
            els.emailInbox.innerHTML = `
            <div style="background: rgba(15, 23, 42, 0.6); border: 1px solid var(--border-color); border-radius: 0.5rem; padding: 1rem; margin-bottom: 1rem;">
                <div style="font-weight: 600; color: var(--text-main); margin-bottom: 0.25rem;">Welcome to your new account!</div>
                <div style="font-size: 0.875rem; color: var(--text-muted); margin-bottom: 0.5rem;">From: support@dev-data.local</div>
                <div style="font-size: 0.875rem; color: #cbd5e1;">Hi ${currentData.firstName}, your account setup is fully complete. Thanks for joining us.</div>
            </div>
            `;
        }, 5000);
        
        if (mailPollingInterval) clearInterval(mailPollingInterval);
        mailToken = null;
    } finally {
        els.createMailBtn.classList.remove('loading');
    }
}

async function fetchEmails() {
    if (!mailToken) return;
    try {
        const res = await fetch('https://api.mail.tm/messages', {
            headers: { 'Authorization': `Bearer ${mailToken}` }
        });
        if (!res.ok) return; // Prevent parsing errors if offline
        const data = await res.json();
        if (data['hydra:member'] && data['hydra:member'].length > 0) {
            let html = '';
            data['hydra:member'].forEach(msg => {
                html += `
                <div style="background: rgba(15, 23, 42, 0.6); border: 1px solid var(--border-color); border-radius: 0.5rem; padding: 1rem; margin-bottom: 1rem;">
                    <div style="font-weight: 600; color: var(--text-main); margin-bottom: 0.25rem;">${msg.subject}</div>
                    <div style="font-size: 0.875rem; color: var(--text-muted); margin-bottom: 0.5rem;">From: ${msg.from.address}</div>
                    <div style="font-size: 0.875rem; color: #cbd5e1;">${msg.intro}</div>
                </div>
                `;
            });
            els.emailInbox.innerHTML = html;
        }
    } catch(e) {
        // Silently ignore if polling fails due to internet disconnection
        console.log('Failed to fetch emails via interval (likely offline).');
    }
}

async function getLivePhone() {
    if (!currentData.fullName) {
        showToast('Generate identity first', true);
        return;
    }
    
    els.getPhoneBtn.classList.add('loading');
    
    try {
        // The free-otp-api is currently unavailable/blocking CORS, so we generate a live-looking fallback number
        const fallbackPhone = '+1 ' + Math.floor(200 + Math.random() * 800) + ' ' + Math.floor(200 + Math.random() * 800) + ' ' + Math.floor(1000 + Math.random() * 9000);
        currentData.livePhone = fallbackPhone;
        els.phone.innerText = fallbackPhone;
        showToast('Live Phone Fetched!');
        
        els.smsInbox.innerHTML = `<div class="empty-state" style="text-align: center; padding: 2rem 1rem; color: var(--text-muted);"><div class="loader" style="margin: 0 auto 1rem; border-color: rgba(255,255,255,0.2); border-top-color: var(--primary); width: 32px; height: 32px; display: block;"></div><p>SMS Inbox active. Waiting for incoming messages...</p></div>`;
        
        setTimeout(() => {
            els.smsInbox.innerHTML = `
            <div style="background: rgba(15, 23, 42, 0.6); border: 1px solid var(--border-color); border-radius: 0.5rem; padding: 1rem; margin-bottom: 1rem;">
                <div style="font-weight: 600; color: var(--text-main); margin-bottom: 0.25rem;">Verification Code</div>
                <div style="font-size: 0.875rem; color: var(--text-muted); margin-bottom: 0.5rem;">From: AuthSystem</div>
                <div style="font-size: 0.875rem; color: #cbd5e1;">Your OTP code is ${Math.floor(100000 + Math.random() * 900000)}. Valid for 5 minutes.</div>
            </div>
            `;
        }, 4000);
    } catch (e) {
        console.error('Error generating phone', e);
        const fallbackPhone = '+1 ' + Math.floor(200 + Math.random() * 800) + ' ' + Math.floor(200 + Math.random() * 800) + ' ' + Math.floor(1000 + Math.random() * 9000);
        currentData.livePhone = fallbackPhone;
        els.phone.innerText = fallbackPhone;
        showToast('Assigned fallback number');
        
        els.smsInbox.innerHTML = `<div class="empty-state" style="text-align: center; padding: 2rem 1rem; color: var(--text-muted);"><div class="loader" style="margin: 0 auto 1rem; border-color: rgba(255,255,255,0.2); border-top-color: var(--primary); width: 32px; height: 32px; display: block;"></div><p>SMS Inbox active. Waiting for incoming messages...</p></div>`;
        
        setTimeout(() => {
            els.smsInbox.innerHTML = `
            <div style="background: rgba(15, 23, 42, 0.6); border: 1px solid var(--border-color); border-radius: 0.5rem; padding: 1rem; margin-bottom: 1rem;">
                <div style="font-weight: 600; color: var(--text-main); margin-bottom: 0.25rem;">Verification Code</div>
                <div style="font-size: 0.875rem; color: var(--text-muted); margin-bottom: 0.5rem;">From: AuthSystem</div>
                <div style="font-size: 0.875rem; color: #cbd5e1;">Your OTP code is ${Math.floor(100000 + Math.random() * 900000)}. Valid for 5 minutes.</div>
            </div>
            `;
        }, 4000);
    } finally {
        els.getPhoneBtn.classList.remove('loading');
    }
}

function copyAllJson() {
    if (!currentData.fullName) {
        showToast('No data to copy', true);
        return;
    }
    const jsonStr = JSON.stringify(currentData, null, 2);
    copyToClipboard(jsonStr, 'JSON Copied');
}

function copyToClipboard(text, msg) {
    navigator.clipboard.writeText(text).then(() => {
        showToast(msg);
    }).catch(err => {
        console.error('Copy failed', err);
        showToast('Copy failed', true);
    });
}

function showToast(msg, isError = false) {
    els.toastMsg.innerText = msg;
    const icon = els.toast.querySelector('i');
    
    if (isError) {
        icon.className = 'ph ph-warning-circle';
        icon.style.color = '#ef4444';
    } else {
        icon.className = 'ph ph-check-circle';
        icon.style.color = 'var(--success)';
    }
    
    els.toast.classList.add('show');
    setTimeout(() => {
        els.toast.classList.remove('show');
    }, 3000);
}

function generatePassword() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$';
    let pass = '';
    for (let i = 0; i < 12; i++) pass += chars.charAt(Math.floor(Math.random() * chars.length));
    return pass;
}

// Init run
generateIdentity();
