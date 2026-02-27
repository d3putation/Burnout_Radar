import { NextRequest, NextResponse } from "next/server";
import { sampleDataset } from "@/data/sample-data";
import { generateWeeklyPlan } from "@/lib/plan";
import { Meeting, WorkPreferences } from "@/lib/types";

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json().catch(() => ({}))) as {
      meetings?: Meeting[];
      preferences?: WorkPreferences;
    };

    const meetings = body.meetings ?? sampleDataset.meetings;
    const preferences = body.preferences ?? { startHour: 9, endHour: 18 };

    const plan = generateWeeklyPlan({ meetings, preferences });
    return NextResponse.json(plan);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to generate plan", detail: (error as Error).message },
      { status: 400 }
    );
  }
}
