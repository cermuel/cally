export type LinkColor = {
  label: string;
  value: string;
};

export const linkColors = [
  { label: 'Cream', value: '#ffdf5c' },
  { label: 'Banana', value: '#fff09a' },
  { label: 'Sand', value: '#ffba7a' },
  { label: 'Coral', value: '#ff9b80' },
  { label: 'Rose', value: '#ffa8b8' },
  { label: 'Blush', value: '#ffcedd' },
  { label: 'Lilac', value: '#c0a8ff' },
  { label: 'Sky', value: '#8ec9ff' },
  { label: 'Aqua', value: '#95dfdc' },
  { label: 'Mint', value: '#8de0a6' },
  { label: 'Sage', value: '#c0d8a8' },
  { label: 'Slate', value: '#cdd2dc' },
] as const satisfies readonly LinkColor[];
