import { getDocumentStyleHead, printHtmlDocument } from "./printDocument";

function syncInputState(source: HTMLElement, clone: HTMLElement) {
  const sourceInputs = Array.from(source.querySelectorAll<HTMLInputElement>("input"));
  const cloneInputs = Array.from(clone.querySelectorAll<HTMLInputElement>("input"));

  sourceInputs.forEach((input, index) => {
    const cloned = cloneInputs[index];
    if (!cloned) return;
    cloned.checked = input.checked;
    if (input.checked) cloned.setAttribute("checked", "");
    else cloned.removeAttribute("checked");
  });
}

async function printPersonDossier() {
  const source = document.querySelector<HTMLElement>(".person-dossier-paper");
  if (!source) return;

  const clone = source.cloneNode(true) as HTMLElement;
  syncInputState(source, clone);

  clone
    .querySelectorAll(
      ".dossier-close, .dossier-footer-actions, .dossier-report-tools, .no-print",
    )
    .forEach((node) => node.remove());

  const title =
    clone.querySelector<HTMLElement>(".dossier-name-row h2")?.textContent?.trim() ||
    "Person Dossier";

  const printOverrides = `
    <base href="${document.baseURI}">
    ${getDocumentStyleHead()}
    <style>
      @page { size: Letter portrait; margin: 0; }

      html,
      body {
        width: 8.5in !important;
        min-height: 11in !important;
        margin: 0 !important;
        padding: 0 !important;
        overflow: visible !important;
        background: #ffffff !important;
        color: #1d2d46 !important;
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
      }

      .person-dossier-paper {
        box-sizing: border-box !important;
        width: 8.5in !important;
        height: 11in !important;
        min-height: 11in !important;
        max-height: 11in !important;
        margin: 0 !important;
        padding: 0.18in 0.22in 0.14in !important;
        overflow: hidden !important;
        border: 0 !important;
        border-radius: 0 !important;
        box-shadow: none !important;
        background: #ffffff !important;
      }

      /* Keep the paper economical: white page/panels, retain meaningful accent colors. */
      .dossier-photo-card,
      .dossier-metadata,
      .dossier-core-card,
      .dossier-core-card > header,
      .dossier-glance,
      .dossier-glance-profile,
      .dossier-glance-matrix,
      .dossier-glance-row {
        background: #ffffff !important;
      }

      .dossier-folder,
      .dossier-tabs,
      .dossier-close,
      .dossier-footer-actions,
      .dossier-report-tools,
      .no-print {
        display: none !important;
      }

      .dossier-review-check {
        display: none !important;
      }

      /* Preserve the established one-page canonical dossier print composition. */
      .dossier-brand-header {
        min-height: 0.54in !important;
        padding: 0 0.34in 0.09in 0.02in !important;
      }
      .dossier-brand-mark { width: 0.42in !important; height: 0.42in !important; }
      .dossier-brand strong { font-size: 15pt !important; }
      .dossier-brand small { font-size: 5.2pt !important; }
      .dossier-brand-header > p {
        display: block !important;
        margin: 0.05in 0.03in 0 0 !important;
        font-size: 7.5pt !important;
        line-height: 1.2 !important;
      }
      .dossier-identity {
        grid-template-columns: 1.28in minmax(0, 1fr) !important;
        gap: 0.14in !important;
        padding: 0.11in 0 0.10in !important;
      }
      .dossier-photo-card { width: auto !important; padding: 0.07in !important; }
      .dossier-photo { height: 1.34in !important; }
      .dossier-photo-card p {
        margin: 0.06in 0.03in 0 !important;
        font-size: 6.7pt !important;
        line-height: 1.15 !important;
      }
      .dossier-title-row {
        grid-template-columns: minmax(0, 1fr) 2.02in !important;
        gap: 0.12in !important;
      }
      .dossier-title-row h1 { font-size: 22pt !important; line-height: 1 !important; }
      .dossier-kicker { margin-top: 0.03in !important; font-size: 5.5pt !important; }
      .dossier-metadata {
        display: grid !important;
        grid-template-columns: 1fr !important;
        gap: 0.02in !important;
        margin: 0 !important;
        padding: 0.055in 0.07in !important;
      }
      .dossier-metadata div {
        grid-template-columns: 0.66in 1fr !important;
        gap: 0.04in !important;
      }
      .dossier-metadata dt { font-size: 5.2pt !important; }
      .dossier-metadata dd { font-size: 6.2pt !important; line-height: 1.12 !important; }
      .dossier-name-row {
        grid-template-columns: minmax(0, 1fr) 1.45in !important;
        gap: 0.10in !important;
        margin-top: 0.08in !important;
      }
      .dossier-name-row h2 { font-size: 16.5pt !important; line-height: 1 !important; }
      .dossier-person-facts {
        display: flex !important;
        gap: 0.04in 0.09in !important;
        margin-top: 0.05in !important;
        font-size: 6.8pt !important;
      }
      .dossier-summary-row {
        grid-template-columns: minmax(0, 1fr) 1.42in !important;
        gap: 0.11in !important;
        margin-top: 0.08in !important;
      }
      .dossier-summary-row > p { font-size: 7.2pt !important; line-height: 1.24 !important; }
      .dossier-summary-row blockquote {
        margin: 0 !important;
        padding: 0.025in 0 0.025in 0.08in !important;
        font-size: 7.7pt !important;
        line-height: 1.23 !important;
      }
      .dossier-core-section { padding-top: 0.09in !important; }
      .dossier-section-heading {
        display: flex !important;
        align-items: end !important;
        justify-content: space-between !important;
        gap: 0.10in !important;
        margin-bottom: 0.055in !important;
        padding: 0 0.02in !important;
      }
      .dossier-section-heading h2 { font-size: 13.5pt !important; line-height: 1 !important; }
      .dossier-section-heading p { margin: 0 !important; font-size: 4.8pt !important; text-align: right !important; }
      .dossier-check-instruction { display: none !important; }
      .dossier-core-grid {
        grid-template-columns: repeat(3, minmax(0, 1fr)) !important;
        grid-auto-flow: row !important;
        gap: 0.055in !important;
      }
      .dossier-core-card { break-inside: avoid !important; page-break-inside: avoid !important; }
      .dossier-core-card > header {
        grid-template-columns: 0.31in minmax(0, 1fr) auto !important;
        gap: 0.045in !important;
        min-height: 0.36in !important;
        padding: 0.035in 0.045in !important;
      }
      .dossier-number { width: 0.29in !important; height: 0.29in !important; font-size: 11pt !important; }
      .dossier-core-title strong { font-size: 6.6pt !important; line-height: 1.05 !important; }
      .dossier-core-title small { margin-top: 0.015in !important; font-size: 4.3pt !important; }
      .dossier-calculation { font-size: 5.2pt !important; }
      .dossier-expression-grid { grid-template-columns: 1fr 1fr !important; }
      .dossier-expression { padding: 0 0.055in 0.055in !important; }
      .dossier-expression + .dossier-expression {
        border-top: 0 !important;
        border-left: 1px solid rgba(101, 77, 39, 0.18) !important;
      }
      .dossier-expression h3 {
        margin: 0 -0.055in 0.035in !important;
        padding: 0.035in 0.04in !important;
        font-size: 5.35pt !important;
      }
      .dossier-expression > p {
        margin: 0 0 0.03in !important;
        font-size: 5.35pt !important;
        line-height: 1.16 !important;
      }
      .dossier-expression ul { padding-left: 0.10in !important; }
      .dossier-expression li {
        margin: 0 0 0.015in !important;
        font-size: 5.55pt !important;
        line-height: 1.13 !important;
      }
      .dossier-trait-check input { width: 8px !important; height: 8px !important; min-height: 8px !important; }
      .dossier-glance-profile {
        display: block !important;
        margin-top: 0.06in !important;
        break-inside: avoid !important;
      }
      .dossier-glance-intro { padding: 0.04in 0.06in !important; }
      .dossier-glance-matrix { display: grid !important; }
      .dossier-glance-row {
        display: grid !important;
        grid-template-columns: 1.18in 1fr 1fr !important;
        gap: 0.06in !important;
        padding: 0.025in 0.05in !important;
        font-size: 4.85pt !important;
        line-height: 1.12 !important;
      }
      .dossier-footer {
        grid-template-columns: auto 1fr !important;
        gap: 0.10in !important;
        margin-top: 0.05in !important;
        padding-top: 0.05in !important;
      }
      .dossier-footer > p { text-align: right !important; font-size: 6.4pt !important; }
    </style>
  `;

  await printHtmlDocument({
    title: `${title} — Person Dossier`,
    bodyHtml: clone.outerHTML,
    extraHead: printOverrides,
    bodyClassName: "lfs-isolated-dossier-print",
  });
}

let installed = false;

/**
 * Captures the legacy dossier Export / Print button before its React onClick
 * calls window.print(), and routes it through the same isolated-print strategy
 * that fixed generated profile reports in Chromium/Edge.
 */
export function installPrintOverrides() {
  if (installed) return;
  installed = true;

  document.addEventListener(
    "click",
    (event) => {
      const target = event.target as HTMLElement | null;
      const dossierPrintButton = target?.closest<HTMLButtonElement>(".dossier-print");
      if (!dossierPrintButton) return;

      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();

      void printPersonDossier().catch((error) => {
        console.error("Unable to print Person Dossier", error);
        window.alert("Unable to prepare the Person Dossier for printing. Please try again.");
      });
    },
    true,
  );
}
