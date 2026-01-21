function parseBooleanRow<T extends Record<string, any>>(row: T): T {
  for (const key in row) {
    const v = row[key];

    if (v === 'S') row[key] = true;
    else if (v === 'N') row[key] = false;
  }

  return row;
}

export function parseBooleanRows<T extends Record<string, any>>(rows: T[]): T[] {
  for (let i = 0; i < rows.length; i++) {
    parseBooleanRow(rows[i]);
  }
  return rows;
}
