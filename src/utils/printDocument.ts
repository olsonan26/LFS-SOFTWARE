export interface PrintHtmlOptions {
  title: string;
  bodyHtml: string;
  extraHead?: string;
  bodyClassName?: string;
}

function waitForTwoFrames(win: Window) {
  return new Promise<void>((resolve) => {
    win.requestAnimationFrame(() => {
      win.requestAnimationFrame(() => resolve());
    });
  });
}

/**
 * Print from an isolated same-origin iframe so app modal/overlay print rules can
 * never hide the document being printed. The iframe stays mounted until the
 * browser closes the print dialog.
 */
export async function printHtmlDocument({
  title,
  bodyHtml,
  extraHead = "",
  bodyClassName = "",
}: PrintHtmlOptions) {
  const iframe = document.createElement("iframe");
  iframe.setAttribute("aria-hidden", "true");
  iframe.tabIndex = -1;
  iframe.style.position = "fixed";
  iframe.style.left = "-10000px";
  iframe.style.top = "0";
  iframe.style.width = "8.5in";
  iframe.style.height = "11in";
  iframe.style.border = "0";
  iframe.style.opacity = "0";
  iframe.style.pointerEvents = "none";
  document.body.appendChild(iframe);

  const win = iframe.contentWindow;
  const doc = iframe.contentDocument;
  if (!win || !doc) {
    iframe.remove();
    throw new Error("Unable to prepare the print document.");
  }

  const cleanup = () => {
    window.setTimeout(() => iframe.remove(), 250);
  };

  win.addEventListener("afterprint", cleanup, { once: true });

  doc.open();
  doc.write(`<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${title.replaceAll("<", "&lt;").replaceAll(">", "&gt;")}</title>
  ${extraHead}
</head>
<body class="${bodyClassName}">
  ${bodyHtml}
</body>
</html>`);
  doc.close();

  await new Promise<void>((resolve) => {
    if (doc.readyState === "complete") resolve();
    else win.addEventListener("load", () => resolve(), { once: true });
  });

  try {
    await doc.fonts?.ready;
  } catch {
    // Printing can continue with fallback fonts.
  }

  await waitForTwoFrames(win);
  win.focus();
  win.print();

  // Some Chromium builds do not emit afterprint for an iframe.
  window.setTimeout(() => {
    if (document.body.contains(iframe)) iframe.remove();
  }, 60_000);
}

export function getDocumentStyleHead() {
  return Array.from(
    document.head.querySelectorAll('style, link[rel="stylesheet"]'),
  )
    .map((node) => node.outerHTML)
    .join("\n");
}
