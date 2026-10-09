export async function resolve(specifier, context, nextResolve) {
  if (specifier === 'cloudflare:workers') {
    return {
      shortCircuit: true,
      url: 'nodejs-fake:cloudflare-workers',
    };
  }
  return nextResolve(specifier, context);
}

export async function load(url, context, nextLoad) {
  if (url === 'nodejs-fake:cloudflare-workers') {
    return {
      format: 'module',
      shortCircuit: true,
      source: `
        const memoryRooms = globalThis.__ROOMS_MAP__ || (globalThis.__ROOMS_MAP__ = new Map());

        const createMemoryDb = () => ({
          prepare(sql) {
            let boundArgs = [];
            const stmt = {
              bind(...args) {
                boundArgs = args;
                return stmt;
              },
              async first() {
                if (sql.includes('SELECT')) {
                  const code = boundArgs[0];
                  const room = memoryRooms.get(code);
                  return room ? { ...room } : null;
                }
                return null;
              },
              async run() {
                if (sql.includes('INSERT')) {
                  const [code, state, revision, updated] = boundArgs;
                  if (memoryRooms.has(code)) {
                    return { meta: { changes: 0 } };
                  }
                  memoryRooms.set(code, { state, revision, updated });
                  return { meta: { changes: 1 } };
                }
                if (sql.includes('UPDATE')) {
                  const [state, revision, updated, code, expectedRevision] = boundArgs;
                  const current = memoryRooms.get(code);
                  if (!current || current.revision !== expectedRevision) {
                    return { meta: { changes: 0 } };
                  }
                  memoryRooms.set(code, { state, revision, updated });
                  return { meta: { changes: 1 } };
                }
                return { meta: { changes: 0 } };
              }
            };
            return stmt;
          }
        });

        export const env = globalThis.__CF_ENV__ || {
          DB: createMemoryDb()
        };
      `,
    };
  }
  return nextLoad(url, context);
}
