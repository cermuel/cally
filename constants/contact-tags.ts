import { linkColors } from "~/constants/link-colors";

export type ContactTagOption = {
  label: string;
  value: string;
  color: string;
};

export const contactTags = [
  { label: "VIP", value: "VIP", color: linkColors[0].value },
  { label: "Lead", value: "Lead", color: linkColors[2].value },
  { label: "Client", value: "Client", color: linkColors[9].value },
  { label: "Partner", value: "Partner", color: linkColors[7].value },
  { label: "Vendor", value: "Vendor", color: linkColors[3].value },
  { label: "Personal", value: "Personal", color: linkColors[6].value },
] satisfies readonly ContactTagOption[];

const presetContactTagColors = new Set<string>(
  contactTags.map((option) => option.color),
);

const customContactTagColors = linkColors.filter(
  (color) => !presetContactTagColors.has(color.value),
);

export const getContactTagColor = (tag: string) => {
  const preset = contactTags.find(
    (option) => option.value.toLowerCase() === tag.toLowerCase(),
  );
  if (preset) return preset.color;

  const colorIndex = [...tag].reduce(
    (total, character) => total + character.codePointAt(0)!,
    0,
  );
  return customContactTagColors[colorIndex % customContactTagColors.length]!
    .value;
};
