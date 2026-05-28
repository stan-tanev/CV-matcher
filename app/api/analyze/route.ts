import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const jobDescription = formData.get("jobDescription") as string;
    const cvFile = formData.get("cvFile") as File;

    if (!jobDescription || !cvFile) {
      return NextResponse.json(
        { error: "Missing job description or CV file" },
        { status: 400 }
      );
    }

    let cvText = "";

    if (cvFile.type === "application/pdf") {
      const arrayBuffer = await cvFile.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const PDFParser = (await import("pdf2json")).default;
      const pdfParser = new PDFParser();
      cvText = await new Promise((resolve, reject) => {
        pdfParser.on("pdfParser_dataReady", (pdfData: any) => {
          const text = pdfData.Pages.map((page: any) =>
            page.Texts.map((t: any) => decodeURIComponent(t.R[0].T)).join(" ")
          ).join("\n");
          resolve(text);
        });
        pdfParser.on("pdfParser_dataError", reject);
        pdfParser.parseBuffer(buffer);
      });
    } else {
      cvText = await cvFile.text();
    }

    if (!cvText || cvText.trim().length < 50) {
      return NextResponse.json(
        { error: "Could not extract text from your CV. Please try a different file." },
        { status: 400 }
      );
    }

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY!,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-opus-4-5",
        max_tokens: 1024,
        messages: [
          {
            role: "user",
            content: `You are an expert CV reviewer and recruiter. Analyze this CV against the job description and respond in this exact JSON format with no extra text:

{
  "score": <number 0-100>,
  "summary": "<2 sentence overall assessment>",
  "strengths": ["<strength 1>", "<strength 2>", "<strength 3>"],
  "gaps": ["<gap 1>", "<gap 2>", "<gap 3>"],
  "suggestions": ["<specific suggestion 1>", "<specific suggestion 2>", "<specific suggestion 3>"]
}

JOB DESCRIPTION:
${jobDescription}

CV:
${cvText}`,
          },
        ],
      }),
    });

    const data = await response.json();

    if (!data.content || !data.content[0]) {
      return NextResponse.json(
        { error: "API error: " + JSON.stringify(data) },
        { status: 500 }
      );
    }

    const content = data.content[0].text;
    const cleaned = content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    const result = JSON.parse(cleaned);

    return NextResponse.json(result);
  } catch (error) {
    console.error("Analysis error:", error);
    return NextResponse.json(
      { error: "Analysis failed. Please try again." },
      { status: 500 }
    );
  }
}