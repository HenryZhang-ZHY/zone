interface PropertyMapping {
  [key: string]: string;
}

function parseArgs(): { url: string; mappings: PropertyMapping } {
  const args = process.argv.slice(2);
  const mappings: PropertyMapping = {};
  let url = '';

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '-p' && i + 1 < args.length) {
      const mapping = args[i + 1];
      const [key, value] = mapping.split(':');
      if (key && value) {
        mappings[key] = value;
      }
      i++;
    } else if (!url && !args[i].startsWith('-')) {
      url = args[i];
    }
  }

  return { url, mappings };
}

async function extractOpenGraph(url: string): Promise<Record<string, string>> {
  try {
    const response = await fetch(url);
    const html = await response.text();

    const ogTags: Record<string, string> = {};

    const ogMetaRegex = /<meta\s+property=["']og:([^"']+)["']\s+content=["']([^"']+)["'][^>]*>/gi;

    let match;
    while ((match = ogMetaRegex.exec(html)) !== null) {
      const property = match[1];
      const content = match[2];
      ogTags[property] = content;
    }

    return ogTags;
  } catch (error) {
    console.error('Error extracting Open Graph data:', error);
    return {};
  }
}

async function main() {
  const { url, mappings } = parseArgs();

  if (!url) {
    console.error('Usage: tsx open-graph-extractor.ts <URL> [-p key:newName ...]');
    console.error('Example: tsx open-graph-extractor.ts -p title:ogTitle -p url:ogUrl https://example.com');
    process.exit(1);
  }

  const ogData = await extractOpenGraph(url);

  if (Object.keys(mappings).length > 0) {
    Object.entries(mappings).forEach(([ogKey, newName]) => {
      if (ogData[ogKey]) {
        console.log(`${newName} ${ogData[ogKey]}`);
      }
    });
  } else {
    Object.entries(ogData).forEach(([property, content]) => {
      console.log(`og:${property} ${content}`);
    });
  }
}

main();
