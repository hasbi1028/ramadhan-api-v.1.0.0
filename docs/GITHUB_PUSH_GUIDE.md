# 🚀 GitHub Push Guide - Ramadhan API

## ✅ Pre-Push Checklist

### **1. Verify .gitignore**
```bash
# Check .gitignore is working
git status --ignored
```

**Should NOT be tracked:**
- ❌ `.env` (contains secrets)
- ❌ `*.db` (database files)
- ❌ `node_modules/`
- ❌ `test-results/`
- ❌ `public/react/` (build output)
- ❌ `backups/`

### **2. Clean Up Files**
```bash
# Remove any tracked sensitive files
git rm --cached .env
git rm --cached *.db
git rm --cached -r node_modules/

# Commit the removal
git commit -m "chore: remove sensitive files from tracking"
```

### **3. Verify Files to Commit**

**✅ Safe to Commit:**
- ✅ Source code (`src/`, `frontend/`)
- ✅ Configuration templates (`.env.example`, `.env.production.example`)
- ✅ Documentation (`docs/`, `README.md`)
- ✅ Public assets (`public/` except build output)
- ✅ Scripts (`scripts/`)
- ✅ Tests (`tests/`)
- ✅ Package files (`package.json`, `bun.lock`)

**❌ DO NOT Commit:**
- ❌ `.env` (contains secrets)
- ❌ `*.db` (database with user data)
- ❌ `node_modules/`
- ❌ `test-results/`, `playwright-report/`
- ❌ `public/react/` (build output)
- ❌ `backups/`
- ❌ `.qwen/`

---

## 📝 Push to GitHub Steps

### **Step 1: Initialize Git (if not done)**
```bash
cd /home/hasbiopm/mts-app/ramadhan-api2
git init
git add .
git commit -m "Initial commit: Ramadhan API v2.0.0"
```

### **Step 2: Create GitHub Repository**

1. Go to [GitHub](https://github.com)
2. Click **"+**" → **"New repository"**
3. Repository name: `ramadhan-api`
4. Description: "Digital Islamic Activity Tracker for Ramadan"
5. Visibility: **Private** (recommended for school project)
6. **DO NOT** initialize with README (we already have one)
7. Click **"Create repository"**

### **Step 3: Add Remote & Push**

```bash
# Add GitHub remote (replace with your repo URL)
git remote add origin https://github.com/YOUR_USERNAME/ramadhan-api.git

# Push to GitHub
git branch -M main
git push -u origin main
```

### **Step 4: Verify Push**

```bash
# Check remote
git remote -v

# Check status
git status
```

---

## 🔒 Security Best Practices

### **1. Never Commit Secrets**

**Before pushing, verify:**
```bash
# Check for .env files
git ls-files | grep "\.env"
# Should only show: .env.example, .env.production.example

# Check for database files
git ls-files | grep "\.db"
# Should be empty

# Check for node_modules
git ls-files | grep "node_modules"
# Should be empty
```

### **2. GitHub Secrets (for CI/CD)**

If setting up CI/CD later, add these to GitHub Secrets:
- `JWT_SECRET` - Generate with `openssl rand -hex 32`
- `DATABASE_URL` - Production database path
- `DEPLOY_KEY` - Deployment credentials

### **3. Branch Protection**

After pushing:
1. Go to repository **Settings** → **Branches**
2. Add branch protection rule for `main`
3. Enable:
   - ✅ Require pull request reviews
   - ✅ Require status checks
   - ✅ Include administrators

---

## 📦 Repository Structure

Your GitHub repo will contain:

```
ramadhan-api/
├── .env.example              # ✅ Template (safe)
├── .env.production.example   # ✅ Template (safe)
├── .gitignore                # ✅ Git ignore rules
├── README.md                 # ✅ Main documentation
├── package.json              # ✅ Dependencies
├── bun.lock                  # ✅ Lock file
├── frontend/src/             # ✅ React source
├── src/                      # ✅ Backend source
├── public/                   # ✅ Static assets
│   ├── manifest.json         # ✅ PWA manifest
│   ├── sw.js                 # ✅ Service Worker
│   └── icons/                # ✅ PWA icons
├── tests/                    # ✅ E2E tests
├── docs/                     # ✅ Documentation
├── scripts/                  # ✅ Build scripts
└── ... (other source files)
```

**NOT included:**
- `.env` ❌
- `*.db` ❌
- `node_modules/` ❌
- `test-results/` ❌
- `public/react/` ❌

---

## 🔄 Post-Push Tasks

### **1. Update README**

Edit `README.md` with:
- [ ] Your GitHub username/org
- [ ] Actual repository URL
- [ ] Contact email
- [ ] License information

### **2. Add GitHub Topics**

In repository settings, add topics:
- `ramadan`
- `islamic-app`
- `react`
- `bun`
- `hono`
- `pwa`
- `school-app`

### **3. Enable GitHub Features**

- [ ] **Issues** - For bug tracking
- [ ] **Projects** - For task management
- [ ] **Discussions** - For Q&A
- [ ] **Wiki** - For additional docs

### **4. Set Up Branch Protection**

Settings → Branches → Add rule:
- Branch name pattern: `main`
- ✅ Require PR before merging
- ✅ Require status checks
- ✅ Include administrators

---

## 🛡️ Security Scan

Before making public (if ever):

```bash
# Scan for secrets
git log --all --full-history --source -- '*secret*'
git log --all --full-history --source -- '*password*'
git log --all --full-history --source -- '*key*'

# Check for accidentally committed files
git ls-files | grep -E "\.(env|db|sql)$"
```

---

## 📊 Repository Stats

After pushing, you'll see:
- **Languages:** TypeScript, JavaScript
- **Size:** ~5-10 MB (without node_modules)
- **Commits:** Initial + your commits
- **Contributors:** You + team

---

## 🎉 Done!

Your repository is now on GitHub!

**Next Steps:**
1. Share repo URL with team
2. Set up CI/CD (optional)
3. Enable GitHub Actions (optional)
4. Add contributors (optional)

---

## 📞 Troubleshooting

### **"fatal: remote origin already exists"**
```bash
git remote remove origin
git remote add origin https://github.com/USER/ramadhan-api.git
```

### **"failed to push some refs"**
```bash
git pull origin main --rebase
git push origin main
```

### **"large files detected"**
```bash
# Install git-lfs
git lfs install

# Track large files
git lfs track "*.png"
git lfs track "*.jpg"

# Re-add files
git add .
git commit -m "fix: track large files with LFS"
git push
```

---

**Happy Coding! 🚀**
