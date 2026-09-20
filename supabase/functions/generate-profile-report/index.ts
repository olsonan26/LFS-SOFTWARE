// @ts-nocheck
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { OpenRouter } from "npm:@openrouter/sdk@1.2.123";
import {
  PROFILE_REPORT_SKILL,
  PROFILE_REPORT_SKILL_VERSION,
} from "./profileReportSkill.ts";

const MODEL = "deepseek/deepseek-v4.1-flash";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

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

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders,
      "Content-Type": "application/json",
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

async function requireApprovedCollaborator(req: Request) {
  const authorization = req.headers.get("Authorization") || "";
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY");
  if (!authorization || !supabaseUrl || !anonKey) return false;

  const response = await fetch(
    `${supabaseUrl}/rest/v1/lfs_collaborators?select=email&limit=1`,
    {
      headers: {
        apikey: anonKey,
        Authorization: authorization,
        Accept: "application/json",
      },
    },
  );
  if (!response.ok) return false;
  const rows = await response.json().catch(() => []);
  return Array.isArray(rows) && rows.length > 0;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }
  if (req.method !== "POST") {
    return json({ error: "Method not allowed." }, 405);
  }

  try {
    if (!(await requireApprovedCollaborator(req))) {
      return json(
        { error: "You must be signed in as an approved LFS collaborator." },
        403,
      );
    }

    const apiKey = Deno.env.get("OPENROUTER_API_KEY");
    if (!apiKey) {
      return json(
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

    if (
      typeof displayName !== "string" ||
      displayName.trim().length < 1 ||
      typeof roleInCase !== "string" ||
      !Array.isArray(perspectives) ||
      perspectives.length !== 6 ||
      !perspectives.every(validPerspective)
    ) {
      return json({ error: "The report input is incomplete or invalid." }, 400);
    }

    const safePayload = {
      person: {
        displayName: displayName.trim().slice(0, 200),
        roleInCase: roleInCase.slice(0, 80),
      },
      perspectives: perspectives.map((item: any) => ({
        id: item.id.slice(0, 80),
        title: item.title.slice(0, 120),
        source: item.source.slice(0, 120),
        calculation: item.calculation.slice(0, 80),
        elevated: item.elevated.slice(0, 12).map((trait: string) => trait.slice(0, 220)),
        shadow: item.shadow.slice(0, 12).map((trait: string) => trait.slice(0, 220)),
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
              "Write the integrated profile report from this reviewed selection data. Use only checked traits.\n\n" +
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

    return json({
      ...report,
      model: MODEL,
      skillVersion: PROFILE_REPORT_SKILL_VERSION,
    });
  } catch (error) {
    console.error("generate-profile-report failed", error);
    return json(
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
