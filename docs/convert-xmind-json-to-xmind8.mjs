import fs from 'node:fs';
import path from 'node:path';

const docsDir = path.resolve('docs');
const inputFile = path.join(docsDir, 'AIGC智能短视频创作助手-测试用例.xmind');
const outputFile = path.join(docsDir, 'AIGC智能短视频创作助手-测试用例-XMind8兼容版.xmind');

function readStoredZipEntry(zipPath, wantedName) {
  const buffer = fs.readFileSync(zipPath);
  let offset = 0;
  while (offset + 30 < buffer.length) {
    const signature = buffer.readUInt32LE(offset);
    if (signature !== 0x04034b50) break;
    const method = buffer.readUInt16LE(offset + 8);
    const compressedSize = buffer.readUInt32LE(offset + 18);
    const fileNameLength = buffer.readUInt16LE(offset + 26);
    const extraLength = buffer.readUInt16LE(offset + 28);
    const nameStart = offset + 30;
    const name = buffer.subarray(nameStart, nameStart + fileNameLength).toString('utf8');
    const dataStart = nameStart + fileNameLength + extraLength;
    const dataEnd = dataStart + compressedSize;

    if (name === wantedName) {
      if (method !== 0) {
        throw new Error(`Unsupported zip compression method: ${method}`);
      }
      return buffer.subarray(dataStart, dataEnd).toString('utf8');
    }
    offset = dataEnd;
  }
  throw new Error(`Zip entry not found: ${wantedName}`);
}

function escapeXml(value = '') {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function xmindId() {
  return `id-${Math.random().toString(36).slice(2, 10)}-${Date.now().toString(36)}`;
}

function topicXml(item, level = 0) {
  const structure = level === 0 ? ' structure-class="org.xmind.ui.logic.right"' : '';
  const children = item.children?.attached || [];
  const notes = item.notes?.plain?.content
    ? `<notes><plain>${escapeXml(item.notes.plain.content)}</plain></notes>`
    : '';
  const childXml = children.length
    ? `<children><topics type="attached">${children.map((child) => topicXml(child, level + 1)).join('')}</topics></children>`
    : '';
  return `<topic id="${escapeXml(item.id || xmindId())}"${structure}><title>${escapeXml(item.title || '')}</title>${notes}${childXml}</topic>`;
}

function crc32(buffer) {
  let table = crc32.table;
  if (!table) {
    table = new Uint32Array(256);
    for (let i = 0; i < 256; i += 1) {
      let c = i;
      for (let j = 0; j < 8; j += 1) {
        c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
      }
      table[i] = c >>> 0;
    }
    crc32.table = table;
  }
  let crc = 0xffffffff;
  for (const byte of buffer) {
    crc = table[(crc ^ byte) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function u16(value) {
  const buffer = Buffer.alloc(2);
  buffer.writeUInt16LE(value);
  return buffer;
}

function u32(value) {
  const buffer = Buffer.alloc(4);
  buffer.writeUInt32LE(value >>> 0);
  return buffer;
}

function dosDateTime(date = new Date()) {
  const time = (date.getHours() << 11) | (date.getMinutes() << 5) | Math.floor(date.getSeconds() / 2);
  const dosDate = ((date.getFullYear() - 1980) << 9) | ((date.getMonth() + 1) << 5) | date.getDate();
  return { time, date: dosDate };
}

function createStoredZip(files) {
  const localParts = [];
  const centralParts = [];
  let offset = 0;
  const dt = dosDateTime();

  for (const file of files) {
    const name = Buffer.from(file.name, 'utf8');
    const data = Buffer.from(file.content, 'utf8');
    const crc = crc32(data);
    const localHeader = Buffer.concat([
      u32(0x04034b50), u16(20), u16(0x0800), u16(0), u16(dt.time), u16(dt.date),
      u32(crc), u32(data.length), u32(data.length), u16(name.length), u16(0), name
    ]);
    localParts.push(localHeader, data);
    centralParts.push(Buffer.concat([
      u32(0x02014b50), u16(20), u16(20), u16(0x0800), u16(0), u16(dt.time), u16(dt.date),
      u32(crc), u32(data.length), u32(data.length), u16(name.length), u16(0), u16(0),
      u16(0), u16(0), u32(0), u32(offset), name
    ]));
    offset += localHeader.length + data.length;
  }

  const local = Buffer.concat(localParts);
  const central = Buffer.concat(centralParts);
  const end = Buffer.concat([
    u32(0x06054b50), u16(0), u16(0), u16(files.length), u16(files.length),
    u32(central.length), u32(local.length), u16(0)
  ]);
  return Buffer.concat([local, central, end]);
}

const contentJson = JSON.parse(readStoredZipEntry(inputFile, 'content.json'));
const sheet = contentJson[0];
const timestamp = Date.now();

const contentXml = `<?xml version="1.0" encoding="UTF-8" standalone="no"?>
<xmap-content xmlns="urn:xmind:xmap:xmlns:content:2.0"
  xmlns:fo="http://www.w3.org/1999/XSL/Format"
  xmlns:svg="http://www.w3.org/2000/svg"
  xmlns:xhtml="http://www.w3.org/1999/xhtml"
  xmlns:xlink="http://www.w3.org/1999/xlink"
  version="2.0">
  <sheet id="${escapeXml(sheet.id || 'sheet-main')}" timestamp="${timestamp}">
    <title>${escapeXml(sheet.title || '测试用例')}</title>
    ${topicXml(sheet.rootTopic)}
  </sheet>
</xmap-content>`;

const metaXml = `<?xml version="1.0" encoding="UTF-8" standalone="no"?>
<meta xmlns="urn:xmind:xmap:xmlns:meta:2.0" version="2.0">
  <Creator><Name>Codex</Name><Version>1.0</Version></Creator>
</meta>`;

const stylesXml = `<?xml version="1.0" encoding="UTF-8" standalone="no"?>
<xmap-styles xmlns="urn:xmind:xmap:xmlns:style:2.0" version="2.0">
  <styles/>
</xmap-styles>`;

const manifestXml = `<?xml version="1.0" encoding="UTF-8" standalone="no"?>
<manifest xmlns="urn:xmind:xmap:xmlns:manifest:1.0">
  <file-entry full-path="content.xml" media-type="text/xml"/>
  <file-entry full-path="meta.xml" media-type="text/xml"/>
  <file-entry full-path="styles.xml" media-type="text/xml"/>
  <file-entry full-path="META-INF/" media-type=""/>
</manifest>`;

fs.writeFileSync(outputFile, createStoredZip([
  { name: 'content.xml', content: contentXml },
  { name: 'meta.xml', content: metaXml },
  { name: 'styles.xml', content: stylesXml },
  { name: 'META-INF/manifest.xml', content: manifestXml }
]));

console.log(outputFile);
