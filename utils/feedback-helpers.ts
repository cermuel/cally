import { imageExtensions, wordExtensions } from "~/constants/feedback";
import type { AttachmentKind } from "~/pages/app/feedback.vue";
import {
  FileImageIcon,
  FileTextIcon,
  Pdf01Icon,
} from "@hugeicons/core-free-icons";

const extensionOf = (file: File) => {
  return file.name.split(".").pop()?.toLowerCase() ?? "";
};

const attachmentKindOf = (file: File): AttachmentKind | null => {
  const extension = extensionOf(file);

  if (file.type.startsWith("image/") || imageExtensions.has(extension)) {
    return "image";
  }

  if (file.type === "application/pdf" || extension === "pdf") {
    return "pdf";
  }

  if (wordExtensions.has(extension)) {
    return "word";
  }

  return null;
};

const iconFor = (kind: AttachmentKind) => {
  if (kind === "image") {
    return FileImageIcon;
  }

  if (kind === "pdf") {
    return Pdf01Icon;
  }

  return FileTextIcon;
};

const iconClassFor = (kind: AttachmentKind) => {
  if (kind === "image") {
    return "text-note-banana";
  }

  if (kind === "pdf") {
    return "text-note-coral";
  }

  return "text-note-lilac";
};

export const feedbackHelpers = { iconClassFor, iconFor, attachmentKindOf };
