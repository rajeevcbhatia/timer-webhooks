interface RowCount {
   count: number;
}

function isRowCount(row: any): row is RowCount {
   return row && typeof row.count === 'number';
}