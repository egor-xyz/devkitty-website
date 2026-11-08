import { type Extension, parseExtension } from './extensionSchema';

export * from './extensionSchema';

const files = import.meta.glob('/src/content/extensions/*.json', { eager: true, import: 'default' });

const extensions: Extension[] = Object.entries(files)
  .map(([path, raw]) => {
    const file = path.split('/').pop() ?? path;
    const ext = parseExtension(raw, file);
    if (`${ext.id}.json` !== file) throw new Error(`${file}: id must equal the file name`);

    return ext;
  })
  .sort((a, b) => a.order - b.order || a.name.localeCompare(b.name));

export function getExtension(id: string): Extension | undefined {
  return extensions.find((e) => e.id === id);
}

export function getExtensions(): Extension[] {
  return extensions;
}
