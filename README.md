# Minuto Mulher

React / Express / tRPC / Drizzle starter, adapted from the Sandbox web-db-user template.

- `pnpm dev`: development server; honors `PORT` (default 3000).
- `pnpm build` / `pnpm start`: build and serve `dist/index.js` and `dist/public/`.
- `pnpm db:migrate`: apply checked-in migrations. `pnpm db:push`: generate and apply new schema changes.
- `pnpm check` / `pnpm test`: types and application tests.

Start with the Webdev skill's default-template guide. Platform login, storage, payments and service contracts live in its shared references; read the relevant capability before extending its helper.

`server/_core/publicConfig.ts` exposes only named public runtime values. Private keys stay server-side. The platform serves managed `/manus-storage/` assets; the application does not register a second proxy.

Platform configuration is readable and editable through `webdev.config`. Default settings are initial values, not enforced constraints. The agent may modify the files, commands and configuration or follow the flexible guide for another stack.

## Publicação e instalação

O projeto já inclui manifesto PWA, favicon, ícones, service worker e `manifest.webmanifest`. Depois do build, a pasta publicada é `dist/public`.

```bash
pnpm install --frozen-lockfile
pnpm check
pnpm build:static
```

Para publicar no GitHub, conecte o projeto ao repositório GitHub confirmado pela plataforma e mantenha a branch `main` como fonte. Para uma publicação estática, use o conteúdo de `dist/public` como artefato do site. Em qualquer navegador compatível, abra o endereço HTTPS publicado e use “Adicionar à tela inicial” ou “Instalar aplicativo”.

O site funciona em domínio raiz ou subpasta porque o build usa caminhos relativos. O service worker mantém o shell básico disponível offline depois da primeira visita.
