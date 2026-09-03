FROM node:22-alpine

WORKDIR /app

RUN npm install -g pnpm@11

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/backend/package.json ./apps/backend/
COPY apps/web/package.json ./apps/web/
COPY packages/i18n/package.json ./packages/i18n/
COPY packages/schema/package.json ./packages/schema/

RUN pnpm install --frozen-lockfile

COPY apps/backend/src ./apps/backend/src
COPY apps/backend/package.json apps/backend/prisma.config.ts apps/backend/tsconfig.json ./apps/backend/

COPY packages/schema/src ./packages/schema/src
COPY packages/schema/prisma ./packages/schema/prisma
COPY packages/schema/package.json packages/schema/tsconfig.json ./packages/schema/

RUN pnpm prisma generate

COPY packages/i18n/messages ./packages/i18n/messages
COPY packages/i18n/project.inlang ./packages/i18n/project.inlang
COPY packages/i18n/package.json ./packages/i18n/

COPY apps/web/src ./apps/web/src
COPY apps/web/public ./apps/web/public
COPY apps/web/index.html apps/web/tsconfig.json apps/web/vite.config.ts ./apps/web/

COPY scripts/build.mjs ./scripts/
COPY turbo.json ./

RUN pnpm build

EXPOSE 3000

CMD ["pnpm", "-F", "backend", "start", "--host"]