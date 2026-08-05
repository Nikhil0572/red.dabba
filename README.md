# RedDabba — Order & Admin App

## Files
- `index.html` + `customer.js` — Customer ordering page (client ko sabse pehle ye dikhega)
- `admin.html` + `admin.js` — Owner ke liye live orders dashboard
- `firebase-config.js` — apni Firebase details yahan
- `firestore.rules` — database security rules
- `style.css` — RedDabba branding (maroon + red + white)
- `manifest.json`, `icon-192.png`, `icon-512.png` — app install ke liye

---

## Step 1 — Firebase Setup (same tarika jo pehle kiya tha)

1. https://console.firebase.google.com par naya project banayein (jaise `reddabba-app`)
2. **Authentication** > Sign-in method > Email/Password enable karein
3. **Firestore Database** banayein (production mode, `asia-south1` region)
4. Firestore > **Rules** tab me is project ki `firestore.rules` ka poora content paste karke Publish karein
5. Project Settings > "</>" (Web) > app register karke jo `firebaseConfig` milega, use `firebase-config.js` me paste kar dein

## Step 2 — Apna Admin Account Banayein

1. Authentication > Users > "Add User" — apna email/password dalein, UID copy karein
2. Firestore > "Start collection":
   - Collection ID: `admins`
   - Document ID: **wahi UID paste karein**
   - Ek field daal dein: `role` (string) = `owner` (ye field sirf record ke liye hai, code isko check nahi karta — bas document ka hona hi kaafi hai)
3. Save karein

Ab `admin.html` khol kar login kar sakte hain.

## Step 3 — Aaj Ki Thali Set Karein

Admin panel me login karke "आज का Menu" tab me जाकर naam, description, price bharke Save kar dein. Customer page automatically wahi dikhayega.

## Step 4 — Deploy (GitHub + Vercel — jo pehle use kiya tha)

1. GitHub par naya repo banayein (jaise `reddabba-app`), saari files upload karein (root me hi, kisi subfolder ke andar nahi — pichli baar wali galti yaad rakhein)
2. Vercel par jayein > "Add New" > "Project" > apna repo import karein
3. Framework: "Other", Build/Output Command khali chhod dein
4. "Deploy" dabayein — 2 minute me live link mil jayega

Client ko dikhane ke liye:
- Main link (jaise `reddabba-app.vercel.app`) → **customer ordering page**
- `/admin.html` laga kar → **apna admin dashboard**

---

## Demo Client Ko Kaise Dikhayein (Convince Karne Ke Liye)

1. Apne phone par live link kholein, ek test order khud place kar dein (apna hi naam/number daal ke)
2. Turant admin panel dusre tab/device me kholein — order **turant** list me aata dikhega (real-time hai, refresh ki zaroorat nahi)
3. Status ko "Preparing" → "Out for Delivery" → "Delivered" karke dikhayein
4. Upar wale 3 stat boxes (Aaj ke Orders, Pending, Kamai) bhi turant update honge

Ye live demo dikhane se client ko turant vishwaas ho jayega ki app real me kaam kar rahi hai.

---

## Aage Jo Add Kar Sakte Hain (Client Impress Karne Ke Liye)

- **WhatsApp order confirmation** — order place hote hi customer ko WhatsApp par message (Twilio/WhatsApp Business API se)
- **Online payment** — abhi COD hai; Razorpay add karke UPI/card bhi le sakte hain
- **Order history dekhna** — customer apna phone number dal kar purane orders dekh sake
- **Multiple items ka menu** — abhi ek fixed thali hai; aage chalkar alag-alag dishes/prices ka pura menu bana sakte hain
- **Delivery boy tracking** — agar delivery staff bhi hai to unke liye alag se location tracking (jaisa maine pehle field-tracker app banaya tha, wahi tarika yahan bhi kaam karega)

## Security Note

Is app me customers bina login kiye order place kar sakte hain (jaanbhoojh kar rakha hai, taaki order karna aasan rahe) — lekin Firestore Rules is tarah likhi hain ki koi bhi customer dusre logon ke orders na dekh sake, na hi unhe edit kar sake. Sirf aapka admin account (jo Firebase Auth se verified hai) orders dekh aur status badal sakta hai.
