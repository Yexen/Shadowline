// must export *named* suggestBibleFields
export async function suggestBibleFields(text: string) {
  // Return a structure your UI can render
  return [
    { label: 'Description', value: text?.slice(0, 200) || '' },
  ];
}

