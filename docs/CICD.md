# 🚀 Zozzona.js — CI/CD Integration Guide

Zozzona is designed to safely run inside automated deployment environments.

This guide shows how to integrate Zozzona into:

- GitHub Actions  
- GitLab CI  
- Bitbucket Pipelines  
- Jenkins  
- Azure DevOps  
- Custom pipelines  

---

# ⚠️ Critical CI/CD Rules

### ✔ Always run Zozzona **after building**  
(build → pack → deploy)

### ✔ Never commit `.env`  
Instead inject `MAP_KEY` from your CI secret store.

### ✔ Never unpack inside CI/CD  
CI/CD must produce **protected** output only.

### ✔ Do not run Husky in CI  
Zozzona should be invoked manually in scripts.

---

# 🔑 Required Environment Variable

All pipelines must supply the same MAP_KEY used during development:

\`\`\`bash
export MAP_KEY=$MAP_KEY
\`\`\`

Store MAP_KEY in:

- GitHub Actions Secrets  
- GitLab CI Variables  
- Jenkins Credentials Manager  
- Azure DevOps Library Key Vault  

---

# 🟦 GitHub Actions Example

\`\`\`yaml
name: Deploy

on:
  push:
    branches: [ main ]

jobs:
  build:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3

      - name: Install Node
        uses: actions/setup-node@v4
        with:
          node-version: "20"

      - name: Install dependencies
        run: npm ci

      - name: Inject MAP_KEY
        run: echo "MAP_KEY=${{ secrets.MAP_KEY }}" >> .env

      - name: Build project
        run: npm run build

      - name: Protect source
        run: npx zozzona pack

      - name: Deploy artifact
        run: |
          # upload packed output to server/storage
          echo "Deploying..."
\`\`\`

---

# 🟩 GitLab CI Example

\`\`\`yaml
deploy:
  stage: deploy
  image: node:20

  script:
    - npm ci
    - echo "MAP_KEY=$MAP_KEY" > .env
    - npm run build
    - npx zozzona pack
    - ./scripts/deploy.sh

  only:
    - main
\`\`\`

---

# 🟧 Bitbucket Pipelines Example

\`\`\`yaml
pipelines:
  branches:
    main:
      - step:
          image: node:20
          script:
            - npm install
            - echo "MAP_KEY=$MAP_KEY" > .env
            - npm run build
            - npx zozzona pack
\`\`\`

---

# 🏭 Jenkins Declarative Pipeline

\`\`\`groovy
pipeline {
  agent any

  environment {
    MAP_KEY = credentials('zozzona-map-key')
  }

  stages {
    stage('Install') {
      steps { sh 'npm ci' }
    }

    stage('Build') {
      steps { sh 'npm run build' }
    }

    stage('Protect') {
      steps { sh 'echo "MAP_KEY=$MAP_KEY" > .env && npx zozzona pack' }
    }

    stage('Deploy') {
      steps { sh './deploy.sh' }
    }
  }
}
\`\`\`

---

# 🚢 Azure DevOps Pipeline

\`\`\`yaml
steps:
  - task: NodeTool@0
    inputs:
      versionSpec: "20.x"

  - script: npm ci

  - script: echo "MAP_KEY=$(MAP_KEY)" > .env

  - script: npm run build

  - script: npx zozzona pack
\`\`\`

---

# 📦 Deployment Strategies

### **Static hosting**  
Upload protected JS bundles.

### **Node servers**  
Deploy packed server code.

### **Hybrid front/back monorepos**  
Run pack on both before artifact assembly.

---

# 🛑 Anti-Patterns

❌ Running unpack in CI  
❌ Generating MAP_KEY in CI  
❌ Committing `.env`  
❌ Running Husky hooks in CI  
❌ Packing your dependencies (`node_modules`)  

---

# ✔ CI/CD Summary

| Step | Required |
|------|----------|
| Install dependencies | ✔ |
| Inject MAP_KEY | ✔ |
| Build project | ✔ |
| Run `zozzona pack` | ✔ |
| Deploy | ✔ |
| Run unpack | ❌ NEVER |
