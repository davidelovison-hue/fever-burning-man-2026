export interface CsvRow {
  rowIndex: number;
  name: string;
  email: string;
  playaName: string;
  campRole: string;
  errors: string[];
  warnings: string[];
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const ALREADY_REQUESTED_MSG = 'Already requested for this camp';

const HEADER_ALIASES: Record<string, keyof Omit<CsvRow, 'rowIndex' | 'errors' | 'warnings'>> = {
  name: 'name',
  'full name': 'name',
  fullname: 'name',
  email: 'email',
  playaname: 'playaName',
  'playa name': 'playaName',
  playa: 'playaName',
  camprole: 'campRole',
  'camp role': 'campRole',
  role: 'campRole',
};

function fieldErrors(row: Pick<CsvRow, 'name' | 'email' | 'playaName' | 'campRole'>): string[] {
  const errors: string[] = [];
  if (!row.name.trim()) errors.push('Missing name');
  if (!row.email.trim()) errors.push('Missing email');
  else if (!EMAIL_RE.test(row.email.trim())) errors.push('Invalid email');
  if (!row.playaName.trim()) errors.push('Missing playa name');
  if (!row.campRole.trim()) errors.push('Missing camp role');
  return errors;
}

export function validateCsvRows(
  rows: CsvRow[],
  options?: { existingEmails?: Set<string> },
): CsvRow[] {
  const withFields = rows.map((r) => ({
    ...r,
    name: r.name.trim(),
    email: r.email.trim().toLowerCase(),
    playaName: r.playaName.trim(),
    campRole: r.campRole.trim(),
    errors: fieldErrors(r),
    warnings: [] as string[],
  }));

  const seen = new Map<string, number>();
  return withFields.map((row) => {
    const errors = [...row.errors];
    const warnings = [...row.warnings];
    if (row.email) {
      if (seen.has(row.email)) {
        errors.push(`Duplicate email (row ${seen.get(row.email)})`);
      } else {
        seen.set(row.email, row.rowIndex);
      }
      if (options?.existingEmails?.has(row.email)) {
        warnings.push(ALREADY_REQUESTED_MSG);
      }
    }
    return { ...row, errors, warnings };
  });
}

export function parseCsv(text: string): CsvRow[] {
  const lines = text.trim().split(/\r?\n/).filter(Boolean);
  if (lines.length === 0) return [];

  const headerCells = lines[0].split(',').map((c) => c.trim().replace(/^"|"$/g, '').toLowerCase());
  const hasHeader = headerCells.some((h) => h in HEADER_ALIASES || h === 'email');
  const dataLines = hasHeader ? lines.slice(1) : lines;

  const colMap: Partial<Record<keyof Omit<CsvRow, 'rowIndex' | 'errors' | 'warnings'>, number>> = {};
  if (hasHeader) {
    headerCells.forEach((h, i) => {
      const key = HEADER_ALIASES[h];
      if (key) colMap[key] = i;
    });
  }

  const rows: CsvRow[] = dataLines.map((line, i) => {
    const cols = line.split(',').map((c) => c.trim().replace(/^"|"$/g, ''));
    const get = (key: keyof Omit<CsvRow, 'rowIndex' | 'errors' | 'warnings'>, fallbackIdx: number) => {
      const idx = colMap[key];
      return (idx !== undefined ? cols[idx] : cols[fallbackIdx]) ?? '';
    };

    const name = hasHeader ? get('name', 0) : get('name', 0);
    const email = hasHeader ? get('email', 1) : get('email', 1);
    const playaName = hasHeader ? get('playaName', 2) : get('playaName', 2);
    const campRole = hasHeader ? get('campRole', 3) : get('campRole', 3);

    return {
      rowIndex: i + (hasHeader ? 2 : 1),
      name: name.trim(),
      email: email.trim().toLowerCase(),
      playaName: playaName.trim(),
      campRole: campRole.trim(),
      errors: [],
      warnings: [],
    };
  });

  return validateCsvRows(rows);
}

export function validRows(rows: CsvRow[]): CsvRow[] {
  return rows.filter((r) => r.errors.length === 0);
}

export const CSV_TEMPLATE = `name,email,playaName,campRole
Sam Rivera,sam@example.com,Dust Bunny,Framing lead
Alex Chen,alex@example.com,Sparkle Pony,Kitchen build
Jordan Lee,jordan@example.com,Moon Dust,Shade structure
Riley Torres,riley@example.com,Cactus King,Power grid
Casey Morgan,casey@example.com,Playa Pete,Signage`;

/** Seed rows shown on Screen 2 load — includes one row with issues for validation demo */
export function getSeedPreviewRows(): CsvRow[] {
  return validateCsvRows([
    { rowIndex: 2, name: 'Sam Rivera', email: 'sam@example.com', playaName: 'Dust Bunny', campRole: 'Framing lead', errors: [], warnings: [] },
    { rowIndex: 3, name: 'Alex Chen', email: 'alex@example.com', playaName: 'Sparkle Pony', campRole: 'Kitchen build', errors: [], warnings: [] },
    { rowIndex: 4, name: 'Jordan Lee', email: 'jordan@example.com', playaName: '', campRole: 'Shade structure', errors: [], warnings: [] },
    { rowIndex: 5, name: 'Riley Torres', email: 'sam@example.com', playaName: 'Cactus King', campRole: 'Power grid', errors: [], warnings: [] },
    { rowIndex: 6, name: '', email: 'casey@example.com', playaName: 'Playa Pete', campRole: 'Signage', errors: [], warnings: [] },
  ]);
}

export function downloadCsvTemplate(): void {
  const blob = new Blob([CSV_TEMPLATE], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'trs-people-template.csv';
  a.click();
  URL.revokeObjectURL(url);
}
