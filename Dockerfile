# syntax=docker/dockerfile:1
# =============================================================================
# ENMProperty Frontend (Next.js 16 + React 19, Turbopack)
#
# Build multi-tahap:
#   1. deps     -> npm ci (memanfaatkan cache lapisan)
#   2. builder  -> next build dengan NEXT_PUBLIC_* disuntik sebagai build arg
#   3. runner   -> image runtime `next start`
#
# PENTING: seluruh variabel berawalan NEXT_PUBLIC_ di-inline saat build,
# sehingga nilainya wajib dikirim melalui build arg (lihat docker-compose.yml).
# Mengubahnya setelah build tidak berefek tanpa build ulang.
# =============================================================================

# ------------------------------------------------------------ Tahap dependensi
FROM node:22-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

# ----------------------------------------------------------------- Tahap build
FROM node:22-alpine AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Argumen NEXT_PUBLIC_* (di-inline saat build). Nilai default kosong agar build
# tidak gagal bila suatu variabel belum diisi.
ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_SITE_URL
ARG NEXT_PUBLIC_GA_ID
ARG NEXT_PUBLIC_LANDING_URL
ARG NEXT_PUBLIC_FIREBASE_API_KEY
ARG NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
ARG NEXT_PUBLIC_FIREBASE_PROJECT_ID
ARG NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
ARG NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
ARG NEXT_PUBLIC_FIREBASE_APP_ID
ARG NEXT_PUBLIC_MIDTRANS_CLIENT_KEY

ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

# -------------------------------------------------------------- Tahap runtime
FROM node:22-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Catatan: next.config.ts juga membaca NEXT_PUBLIC_API_URL / NEXT_PUBLIC_SITE_URL
# saat runtime untuk menyusun remotePatterns pengoptimal gambar, sehingga kedua
# nilai itu tetap disediakan lewat `environment:` pada docker-compose.yml.

# node_modules disalin utuh (termasuk devDependencies) karena Next.js memuat
# next.config.ts saat start sehingga TypeScript perlu tersedia.
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/next.config.ts ./next.config.ts
COPY --from=builder /app/tsconfig.json ./tsconfig.json

EXPOSE 3000
CMD ["npx", "next", "start", "-H", "0.0.0.0", "-p", "3000"]
