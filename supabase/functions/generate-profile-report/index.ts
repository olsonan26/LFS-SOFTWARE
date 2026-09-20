// @ts-nocheck
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { OpenRouter } from "npm:@openrouter/sdk@1.2.123";
import {
  PROFILE_REPORT_SKILL,
  PROFILE_REPORT_SKILL_VERSION,
} from "./profileReportSkill.ts";

const MODEL = "deepseek/deepseek-v4.1-flash";
const REPORT_CLIENT = "lfs-dossier-v1";
const DEFAULT_SUPABASE_URL = "https://frejicmqhsenqmdmqmfe.supabase.co";
const DEFAULT_SUPABASE_PUBLISHABLE_KEY =
  "sb_publishable_evdIHrK_2Kw-1DpJjYgkYg_9sBv5W09";
const ALLOWED_ORIGINS = new Set([
  "https://lfssoftware.vercel.app",
  "http://localhost:3000",
  "http://localhost:5173",
]);

function isAllowedOrigin(req: Request) {
  const origin = req.headers.get("origin") || "";
  return ALLOWED_ORIGINS.has(origin);
}

function corsHeaders(req: Request) {
  const origin = req.headers.get("origin") || "";
  return {
    "Access-Control-Allow-Origin": ALLOWED_ORIGINS.has(origin)
      ? origin
      : "https://lfssoftware.vercel.app",
    "Access-Control-Allow-Headers":
      "authorization, x-client-info, apikey, content-type, x-lfs-report-client",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    Vary: "Origin",
  };
}

const reportSchema = {
  type: "object",
  additionalProperties: false,
  properties: {
    title: { type: "string", minLength: 8, maxLength: 180 },
    executiveSummary: { type: "string", minLength: 250 },
    sections: {
      type: "array",
      minItems: 6,
      maxItems: 8,
      items: {
        type: "object",
        additionalProperties: false,
        properties: {
          heading: { type: "string", minLength: 4, maxLength: 120 },
          paragraphs: {
            type: "array",
            minItems: 2,
            maxItems: 4,
            items: { type: "string", minLength: 100 },
          },
        },
        required: ["heading", "paragraphs"],
      },
    },
    analystSummary: {
      type: "array",
      minItems: 5,
      maxItems: 8,
      items: { type: "string", minLength: 20, maxLength: 320 },
    },
    limitations: { type: "string", minLength: 120, maxLength: 1200 },
  },
  required: [
    "title",
    "executiveSummary",
    "sections",
    "analystSummary",
    "limitations",
  ],
};

function json(req: Request, body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders(req),
      "Content-Type": "application/json",
      "Cache-Control": "no-store",
    },
  });
}

function normalizeContent(content: unknown) {
  if (typeof content === "string") return content;
  if (Array.isArray(content)) {
    return content
      .map((part) => {
        if (typeof part === "string") return part;
        if (part && typeof part === "object" && "text" in part) {
          return String((part as { text?: unknown }).text || "");
        }
        return "";
      })
      .join("");
  }
  if (content && typeof content === "object") return JSON.stringify(content);
  return "";
}

function validPerspective(item: any) {
  return (
    item &&
    typeof item.id === "string" &&
    typeof item.title === "string" &&
    typeof item.source === "string" &&
    typeof item.calculation === "string" &&
    Array.isArray(item.elevated) &&
    Array.isArray(item.shadow) &&
    item.elevated.every((trait: unknown) => typeof trait === "string") &&
    item.shadow.every((trait: unknown) => typeof trait === "string")
  );
}

function normalizeAssessment(raw: any) {
  const numericScale = Number(raw?.toneScale ?? 5);
  if (!Number.isFinite(numericScale) || numericScale < 0 || numericScale > 10) {
    return null;
  }
  return {
    toneScale: Math.round(numericScale),
    notes: typeof raw?.notes === "string" ? raw.notes.trim().slice(0, 4000) : "",
  };
}

async function fingerprintFor(req: Request, salt: string) {
  const forwarded = req.headers.get("x-forwarded-for") || "";
  const ip =
    req.headers.get("cf-connecting-ip") ||
    forwarded.split(",")[0]?.trim() ||
    "unknown";
  const userAgent = req.headers.get("user-agent") || "unknown";
  const raw = new TextEncoder().encode(`${salt}|${ip}|${userAgent}`);
  const digest = await crypto.subtle.digest("SHA-256", raw);
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

async function enforceRateLimit(req: Request, salt: string) {
  const supabaseUrl = Deno.env.get("SUPABASE_URL") || DEFAULT_SUPABASE_URL;
  const publishableKey =
    Deno.env.get("SUPABASE_ANON_KEY") || DEFAULT_SUPABASE_PUBLISHABLE_KEY;
  const fingerprint = await fingerprintFor(req, salt);

  const response = await fetch(
    `${supabaseUrl}/rest/v1/rpc/lfs_reserve_profile_report_slot`,
    {
      method: "POST",
      headers: {
        apikey: publishableKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ p_fingerprint: fingerprint }),
    },
  );

  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    console.error("Profile report rate-limit RPC failed", response.status, detail);
    throw new Error("Unable to verify the report generation limit.");
  }

  const allowed = await response.json().catch(() => false);
  return allowed === true;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders(req) });
  }
  if (req.method !== "POST") {
    return json(req, { error: "Method not allowed." }, 405);
  }

  try {
    if (!isAllowedOrigin(req)) {
      return json(req, { error: "Report generation is only available inside LFS." }, 403);
    }

    if (req.headers.get("x-lfs-report-client") !== REPORT_CLIENT) {
      return json(req, { error: "Invalid report client." }, 403);
    }

    const apiKey = Deno.env.get("OPENROUTER_API_KEY");
    if (!apiKey) {
      return json(
        req,
        {
          error:
            "The profile report service is not configured yet. Add OPENROUTER_API_KEY to the Supabase Edge Function secrets.",
        },
        503,
      );
    }

    const body = await req.json().catch(() => null);
    const displayName = body?.person?.displayName;
    const roleInCase = body?.person?.roleInCase;
    const perspectives = body?.perspectives;
    const assessment = normalizeAssessment(body?.assessment);

    if (
      typeof displayName !== "string" ||
      displayName.trim().length < 1 ||
      typeof roleInCase !== "string" ||
      !Array.isArray(perspectives) ||
      perspectives.length !== 6 ||
      !perspectives.every(validPerspective) ||
      !assessment
    ) {
      return json(req, { error: "The report input is incomplete or invalid." }, 400);
    }

    if (!(await enforceRateLimit(req, apiKey))) {
      return json(
        req,
        { error: "The temporary report generation limit has been reached." },
        429,
      );
    }

    const safePayload = {
      person: {
        displayName: displayName.trim().slice(0, 200),
        roleInCase: roleInCase.slice(0, 80),
      },
      assessment,
      perspectives: perspectives.map((item: any) => ({
        id: item.id.slice(0, 80),
        title: item.title.slice(0, 120),
        source: item.source.slice(0, 120),
        calculation: item.calculation.slice(0, 80),
        elevated: item.elevated
          .slice(0, 12)
          .map((trait: string) => trait.slice(0, 220)),
        shadow: item.shadow
          .slice(0, 12)
          .map((trait: string) => trait.slice(0, 220)),
      })),
    };

    const openrouter = new OpenRouter({ apiKey });
    const result = await openrouter.chat.send({
      chatRequest: {
        model: MODEL,
        messages: [
          { role: "system", content: PROFILE_REPORT_SKILL },
          {
            role: "user",
            content:
              "Write the integrated profile report from this reviewed selection data. The analyst assessment is high-priority framing guidance: preserve its meaning, improve its writing, and let the 0–10 scale materially affect emphasis and word choice without inventing facts or traits. Use only checked traits plus the supplied analyst framing.\n\n" +
              JSON.stringify(safePayload, null, 2),
          },
        ],
        responseFormat: {
          type: "json_schema",
          jsonSchema: {
            name: "lettrology_person_profile_report",
            strict: true,
            schema: reportSchema,
          },
        },
        temperature: 0.42,
        maxTokens: 6500,
        stream: false,
      },
    } as any);

    if (!("choices" in result)) {
      throw new Error("OpenRouter returned an unexpected response type.");
    }

    const content = normalizeContent(result.choices?.[0]?.message?.content);
    if (!content) throw new Error("OpenRouter returned an empty report.");

    let report: any;
    try {
      report = JSON.parse(content);
    } catch {
      throw new Error("OpenRouter returned a report that could not be parsed.");
    }

    if (
      !report ||
      typeof report.title !== "string" ||
      typeof report.executiveSummary !== "string" ||
      !Array.isArray(report.sections) ||
      !Array.isArray(report.analystSummary) ||
      typeof report.limitations !== "string"
    ) {
      throw new Error("OpenRouter returned an incomplete profile report.");
    }

    return json(req, {
      ...report,
      model: MODEL,
      skillVersion: PROFILE_REPORT_SKILL_VERSION,
    });
  } catch (error) {
    console.error("generate-profile-report failed", error);
    return json(
      req,
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to generate the profile report.",
      },
      500,
    );
  }
});
