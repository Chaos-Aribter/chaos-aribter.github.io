export function validateImageUrl(value: string): string {
  let url: URL;
  try { url = new URL(value); } catch { throw new Error('图片必须填写完整 HTTP/HTTPS URL'); }
  if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password || /[\s<>]/.test(value)) throw new Error('图片必须填写无账号密码的 HTTP/HTTPS URL');
  return value;
}

export type Block = { type: 'paragraph' | 'heading' | 'quote'; text: string } | { type: 'list'; items: string[] } | { type: 'image'; src: string; alt: string; caption?: string };

export function parseBody(source: string): Block[] {
  const blocks: Block[] = [];
  const lines = source.replace(/\r/g, '').split('\n');
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    const image = line.match(/^!\[([^\]]*)\]\((.+)\)$/);
    if (image) {
      validateImageUrl(image[2]);
      const caption = lines[i + 1]?.trim().match(/^\*([^*]+)\*$/)?.[1];
      blocks.push({ type: 'image', src: image[2], alt: image[1], caption });
      if (caption) i++;
      continue;
    }
    if (/[<>]|https?:|\[[^\]]*\]\(|\*|`|\|/.test(line) && !line.startsWith('> ')) throw new Error(`不支持的正文格式：${line.slice(0, 40)}`);
    if (line.startsWith('## ')) blocks.push({ type: 'heading', text: line.slice(3) });
    else if (line.startsWith('> ')) {
      if (/[<>]|https?:|\[[^\]]*\]\(|\*|`/.test(line.slice(2))) throw new Error('引用含不支持的格式');
      blocks.push({ type: 'quote', text: line.slice(2) });
    } else if (line.startsWith('- ')) {
      const previous = blocks.at(-1);
      if (previous?.type === 'list') previous.items.push(line.slice(2));
      else blocks.push({ type: 'list', items: [line.slice(2)] });
    } else {
      if (/^(#|!\[|\d+\.)/.test(line)) throw new Error('只支持二级标题、无序列表及图片 URL');
      const previous = blocks.at(-1);
      if (previous?.type === 'paragraph' && i > 0 && lines[i - 1].trim()) previous.text += ' ' + line;
      else blocks.push({ type: 'paragraph', text: line });
    }
  }
  return blocks;
}

export function readingTime(body: string) {
  const text = parseBody(body).flatMap(b => b.type === 'image' ? [] : b.type === 'list' ? b.items : [b.text]).join('');
  return `阅读 ${Math.max(1, Math.ceil(Array.from(text).length / 300))} 分钟`;
}
