
***

## 🎯 Project Overview

A single-page web app that generates a full fake identity in one click — name, email, phone, address, username, and test card — using only free, no-API-key services.

***

## 🧱 Tech Stack (All Free)

- **Frontend:** Next.js (free) or plain HTML/CSS/JS (even simpler)
- **Hosting:** Vercel (free tier, unlimited personal projects)
- **APIs:** All free, no keys needed
- **Styling:** Tailwind CSS via CDN

***

## 🔌 API Mapping (All Free, No Key)

| Data Type | API | Endpoint |
|---|---|---|
| **Full Identity** (name, email, phone, address) | FakerAPI | `https://fakerapi.it/api/v2/persons?_quantity=1&_locale=en_IN`  [fakerapi](https://www.fakerapi.it) |
| **Temp Email Inbox** | Mail.tm | `POST https://api.mail.tm/accounts`  [docs.mail](https://docs.mail.tm) |
| **Temp Phone + SMS** | free-otp-api | `GET https://free-otp-api.onrender.com/numbers`  [github](https://github.com/Shelex/free-otp-api) |
| **Fake Card Number** | CardGuru scrape or Luhn algo | Generate locally via JS Luhn function |
| **Random Username** | RandomUsernameAPI | `GET https://randomusernameapi.github.io/api/?results=1`  [github](https://github.com/randomusernameapi/randomusernameapi.github.io) |

***

## 🗂️ App Structure

```
dev-data-generator/
├── index.html          ← Single page, all-in-one
├── style.css           ← Tailwind + custom tokens
└── app.js              ← API calls + Luhn card generator
```

***

## 🔄 App Flow

1. User opens the app
2. Clicks **"Generate Identity"**
3. App fires parallel `fetch()` calls to FakerAPI + RandomUsernameAPI
4. Luhn algorithm runs **locally in JS** (no API needed) to generate card number
5. All data populates the UI card instantly
6. **"Create Live Email"** button calls Mail.tm to spin up a real inbox
7. **"Get Phone Number"** button calls free-otp-api to grab a live SMS number
8. **"Copy All"** button copies everything as JSON to clipboard

***

## 🧩 Feature Breakdown

### Core Features (Build First)
- Full fake identity card (name, DOB, email, phone, address, gender)
- Luhn-valid fake Visa/MC card with expiry + CVV
- Random username generation
- One-click copy per field or copy all as JSON
- Refresh button to regenerate everything

### Level 2 Features (Add Next)
- Live temp email inbox viewer — show incoming emails inside the app
- Country/locale selector (IN, US, UK, etc.) for localized data
- Bulk generate (1–50 identities) with CSV export

### Level 3 Features (Polish)
- Dark/light mode toggle
- History tab — last 10 generated identities stored in memory
- QR code generator for phone numbers (using `qrcode.js` CDN)

***

## 💳 Luhn Card Generator (Pure JS, No API)

```javascript
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

// Visa starts with 4, Mastercard with 5
const visaCard = generateLuhn("4");
const mcCard = generateLuhn("5");
```
Zero API calls, instant, unlimited — works offline.

***

## 🚀 Build Order (1 Weekend Plan)

| Day | Task |
|---|---|
| **Hour 1** | Set up HTML shell + Tailwind + design tokens |
| **Hour 2** | Integrate FakerAPI + RandomUsernameAPI + Luhn card |
| **Hour 3** | Build Mail.tm live inbox integration |
| **Hour 4** | Add free-otp-api phone number tab |
| **Hour 5** | Copy-to-clipboard, JSON export, polish UI |
| **Hour 6** | Deploy to Vercel (free), test on mobile |

***

## ⚡ Total Cost

| Item | Cost |
|---|---|
| All APIs | ₹0 — no keys, no limits |
| Hosting (Vercel) | ₹0 — free tier |
| Domain | ₹0 — use `.vercel.app` subdomain |
| Libraries (Tailwind, qrcode.js) | ₹0 — CDN |
| **Total** | **₹0 forever** |

***