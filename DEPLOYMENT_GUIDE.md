# 🚀 GUIDA DEPLOYMENT - MA CHE SERATA

## 📋 OVERVIEW

Questa guida ti accompagna nel deployment completo della piattaforma **Ma Che Serata** su:
- **GitHub** (Repository code)
- **Supabase** (Database + Storage + Auth)  
- **Netlify** (Frontend + Serverless Functions)

---

## 🎯 STACK TECNOLOGICO

### Frontend
- **HTML5/CSS3/JavaScript** - Core application
- **Glassmorphism Design** - Modern UI/UX
- **Mobile-First Responsive** - PWA ready
- **i18n Support** - IT/EN multilingual

### Backend  
- **Netlify Functions** - Serverless backend
- **Supabase** - PostgreSQL + Storage + Auth
- **JWT Authentication** - Secure API access

### Advanced Features
- **Gamification System** - Points, badges, leaderboard
- **Push Notifications** - PWA service worker
- **GDPR Compliance** - Cookie consent + data rights
- **Feedback System** - Post-event automation
- **Analytics Dashboard** - B2B investor metrics

---

## 📂 STRUTTURA PROGETTO

```
ma-che-serata/
├── 📄 index.html                 # Homepage
├── 📄 dashboard.html             # Matcher dashboard  
├── 📄 pr-dashboard.html          # PR dashboard
├── 📄 manager-dashboard.html     # Manager dashboard
├── 📄 artist-dashboard.html      # Artist dashboard
├── 📄 investors-dashboard.html   # B2B analytics
├── 📄 admin.html                 # Admin panel
├── 📄 flir2night.html           # Community forum
├── 🎨 styles.css                 # Main styles (2096 lines)
├── 🎨 flir2night.css            # Forum styles
├── 📦 package.json               # Dependencies
├── ⚙️ netlify.toml               # Netlify config
├── 📁 js/                        # JavaScript modules (17 files)
│   ├── app.js                   # Core application
│   ├── auth.js                  # Authentication  
│   ├── dashboard-router.js      # Routing system
│   ├── gamification.js          # Points & badges
│   ├── i18n.js                  # Multilingual
│   ├── feedback-system.js       # Post-event feedback
│   ├── push-notifications.js    # PWA notifications
│   ├── gdpr-compliance.js       # Privacy compliance
│   └── ...                      # Other modules
└── 📁 netlify/functions/         # Backend API (13 functions)
    ├── api-public.js            # Public API endpoints
    ├── register-user.js         # User registration
    ├── upload-image.js          # File uploads
    └── ...                      # Other functions
```

---

## 🔧 STEP 1: SETUP GITHUB

### 1. Crea Repository
```bash
# Nel tuo terminale locale
git init
git add .
git commit -m "🎉 Initial commit - Ma Che Serata Platform"

# Crea repo su GitHub, poi:
git remote add origin https://github.com/TUO_USERNAME/ma-che-serata.git
git branch -M main
git push -u origin main
```

### 2. Struttura Branch (Opzionale)
```bash
git checkout -b development
git checkout -b staging  
git checkout main
```

---

## 🗄️ STEP 2: SETUP SUPABASE

### 1. Crea Progetto Supabase
1. Vai su [supabase.com](https://supabase.com)
2. Crea nuovo progetto: **"Ma Che Serata"**
3. Regione: **EU Central (Frankfurt)** per GDPR
4. Salva **Project URL** e **API Key**

### 2. Database Schema
Esegui queste query nel **SQL Editor** di Supabase:

```sql
-- Tabella utenti principale
CREATE TABLE users (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    user_type VARCHAR(50) NOT NULL CHECK (user_type IN ('matcher', 'pr', 'manager', 'artist')),
    account_status VARCHAR(50) DEFAULT 'active' CHECK (account_status IN ('active', 'trial_period', 'pending_validation', 'banned', 'rejected')),
    professional_info JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabella profili utente
CREATE TABLE user_profiles (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    description TEXT,
    interests TEXT[],
    profile_photo TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabella eventi
CREATE TABLE events (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    date TIMESTAMP WITH TIME ZONE NOT NULL,
    venue_name VARCHAR(255),
    address TEXT,
    city VARCHAR(100),
    category VARCHAR(50),
    price DECIMAL(10,2),
    capacity INTEGER,
    status VARCHAR(50) DEFAULT 'active',
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabella prenotazioni
CREATE TABLE bookings (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    event_id UUID REFERENCES events(id) ON DELETE CASCADE,
    status VARCHAR(50) DEFAULT 'confirmed',
    party_size INTEGER DEFAULT 1,
    booking_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabella post forum (Flir2night)
CREATE TABLE forum_posts (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    image_urls TEXT[],
    likes_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabella feedback eventi
CREATE TABLE event_feedback (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    event_id UUID REFERENCES events(id) ON DELETE CASCADE,
    overall_rating INTEGER CHECK (overall_rating >= 1 AND overall_rating <= 5),
    ratings JSONB, -- {music: 4, location: 5, atmosphere: 4, company: 3}
    comment TEXT,
    tags TEXT[],
    photo_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabella gamification
CREATE TABLE user_gamification (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    cheers_points INTEGER DEFAULT 0,
    level INTEGER DEFAULT 1,
    badges TEXT[],
    vibes_index DECIMAL(5,2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indici per performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_events_date ON events(date);
CREATE INDEX idx_events_city ON events(city);
CREATE INDEX idx_bookings_user_id ON bookings(user_id);
CREATE INDEX idx_forum_posts_created_at ON forum_posts(created_at DESC);

-- Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE forum_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_gamification ENABLE ROW LEVEL SECURITY;

-- Policies base (da personalizzare secondo le tue esigenze)
CREATE POLICY "Users can view own data" ON users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own data" ON users FOR UPDATE USING (auth.uid() = id);
```

### 3. Storage Buckets
Crea questi bucket in **Storage**:

```sql
-- Bucket per immagini profilo
INSERT INTO storage.buckets (id, name, public) VALUES ('profiles', 'profiles', true);

-- Bucket per immagini forum  
INSERT INTO storage.buckets (id, name, public) VALUES ('flir2night', 'flir2night', true);

-- Bucket per immagini eventi
INSERT INTO storage.buckets (id, name, public) VALUES ('events', 'events', true);

-- Policies storage
CREATE POLICY "Public access to profiles" ON storage.objects FOR SELECT USING (bucket_id = 'profiles');
CREATE POLICY "Users can upload profiles" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'profiles');
CREATE POLICY "Public access to flir2night" ON storage.objects FOR SELECT USING (bucket_id = 'flir2night');
CREATE POLICY "Users can upload flir2night" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'flir2night');
```

---

## 🌐 STEP 3: SETUP NETLIFY

### 1. Deploy da GitHub
1. Vai su [netlify.com](https://netlify.com)
2. **New site from Git** 
3. Connetti GitHub repository
4. **Build settings:**
   - Build command: (lascia vuoto)
   - Publish directory: `.` (root)

### 2. Variabili Ambiente
In **Site settings > Environment variables** aggiungi:

```bash
# Supabase Configuration
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# API Configuration  
API_SECRET=your-jwt-secret-key-here

# Optional: OneSignal for Push Notifications
ONESIGNAL_APP_ID=your-onesignal-app-id

# Optional: Email Service (per notifiche)
SMTP_HOST=your-smtp-host
SMTP_USER=your-smtp-user  
SMTP_PASS=your-smtp-password
```

### 3. Netlify Functions
Le functions sono già configurate in `netlify/functions/`. Netlify le rileverà automaticamente.

### 4. Dominio Personalizzato (Opzionale)
1. **Domain settings > Add custom domain**
2. Configura DNS del tuo dominio:
   ```
   Type: CNAME
   Name: www (o @)  
   Value: your-site-name.netlify.app
   ```

---

## 🔑 STEP 4: CONFIGURAZIONE SICUREZZA

### 1. Supabase RLS Policies
Personalizza le policies secondo le tue esigenze:

```sql
-- Policy esempi più dettagliate
CREATE POLICY "Users can see public profiles" ON user_profiles 
FOR SELECT USING (true);

CREATE POLICY "Users can edit own profile" ON user_profiles 
FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can see active events" ON events 
FOR SELECT USING (status = 'active');

-- Admin può vedere tutto
CREATE POLICY "Admins can see all" ON users 
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM users 
    WHERE id = auth.uid() 
    AND user_type = 'admin'
  )
);
```

### 2. JWT Secret
Genera una chiave sicura per JWT:

```bash
# Usa uno di questi metodi
openssl rand -base64 32
# oppure
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

---

## 🧪 STEP 5: TESTING

### 1. Test Locale
```bash
# Installa Netlify CLI
npm install -g netlify-cli

# Test locale con functions
netlify dev
```

### 2. Test Staging
1. Crea branch `staging` 
2. Deploy su Netlify staging
3. Testa tutte le funzionalità

### 3. Test di Carico (Opzionale)
```bash
# Installa artillery per load testing
npm install -g artillery

# Test API endpoints
artillery quick --count 10 --num 100 https://your-site.netlify.app/api/health
```

---

## 🎯 STEP 6: CONFIGURAZIONI AVANZATE

### 1. PWA Setup
Aggiungi `manifest.json`:

```json
{
  "name": "Ma Che Serata",
  "short_name": "MaChèSerata",
  "description": "Nightlife & Events Platform",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#0a0e1a",
  "theme_color": "#667eea",
  "icons": [
    {
      "src": "/icon-192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/icon-512.png", 
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}
```

### 2. Service Worker
Crea `sw.js` nella root:

```javascript
// Service Worker per Push Notifications
self.addEventListener('push', function(event) {
  const options = {
    body: event.data ? event.data.text() : 'Nuovo aggiornamento!',
    icon: '/icon-192.png',
    badge: '/badge-72.png',
    vibrate: [100, 50, 100]
  };
  
  event.waitUntil(
    self.registration.showNotification('Ma Che Serata', options)
  );
});
```

### 3. Redirects & Headers
Configura in `netlify.toml`:

```toml
[build]
  functions = "netlify/functions"

[[redirects]]
  from = "/api/*"
  to = "/.netlify/functions/:splat"
  status = 200

[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-XSS-Protection = "1; mode=block"
    X-Content-Type-Options = "nosniff"
    Referrer-Policy = "strict-origin-when-cross-origin"
```

---

## 📊 STEP 7: MONITORAGGIO

### 1. Analytics
```javascript
// Google Analytics 4 (opzionale)
// Aggiungi in index.html se GDPR consent = true
gtag('config', 'GA_MEASUREMENT_ID');
```

### 2. Error Tracking
```javascript
// Sentry (opzionale)
window.addEventListener('error', (event) => {
  console.error('Error captured:', event.error);
  // Send to monitoring service
});
```

### 3. Performance Monitoring
- **Netlify Analytics** - Traffico e performance
- **Supabase Dashboard** - Database metrics
- **Lighthouse** - Core Web Vitals

---

## 🚀 STEP 8: GO LIVE!

### 1. Pre-Launch Checklist
- [ ] ✅ Database popolato con dati di test
- [ ] ✅ Storage buckets configurati  
- [ ] ✅ Variabili ambiente impostate
- [ ] ✅ HTTPS attivo (automatico Netlify)
- [ ] ✅ Dominio personalizzato (opzionale)
- [ ] ✅ Test tutte le dashboard
- [ ] ✅ Test registrazione utenti
- [ ] ✅ Test upload immagini
- [ ] ✅ Test notifiche push
- [ ] ✅ Test GDPR compliance

### 2. Launch Day
1. **Merge `staging` → `main`**
2. **Deploy automatico su Netlify**  
3. **Test finale produzione**
4. **Monitoring attivo**

### 3. Post-Launch
- Monitora errori prime 24h
- Raccoglia feedback utenti
- Ottimizza performance se necessario

---

## 🎉 CONGRATULAZIONI!

**La piattaforma Ma Che Serata è ora LIVE!** 🚀

### URLs Finali
- **Frontend:** `https://your-domain.com`
- **API:** `https://your-domain.com/api/`
- **Admin:** `https://your-domain.com/admin.html`
- **Test Page:** `https://your-domain.com/test-functionality.html`

### Credenziali Admin Default
1. Registrati come primo utente
2. Cambia manualmente `user_type` in database a `admin`
3. Accedi ad admin panel

---

## 🆘 TROUBLESHOOTING

### Problemi Comuni

**❌ Functions non funzionano**
```bash
# Verifica environment variables
netlify env:list

# Check function logs  
netlify functions:log
```

**❌ Database connection error**
```bash
# Verifica SUPABASE_URL e SUPABASE_ANON_KEY
# Controlla RLS policies
```

**❌ Upload immagini fallisce**
```bash
# Verifica storage policies
# Controlla CORS settings Supabase
```

**❌ Push notifications non funzionano**
```bash
# Verifica HTTPS attivo
# Controlla Service Worker registrazione
# Testa su dispositivo reale (non localhost)
```

### Support
- **GitHub Issues:** Per bug report
- **Supabase Discord:** Per problemi database  
- **Netlify Support:** Per problemi deployment

---

**🎊 BUONA FORTUNA CON LA TUA PIATTAFORMA!**