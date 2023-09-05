interface RowCount {
  count: number;
}

export function isRowCount(row: any): row is RowCount {
  return row && typeof row.count === 'number';
}
