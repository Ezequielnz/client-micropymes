import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const { token, action } = (await request.json().catch(() => ({ token: undefined })) as {
      token?: string
      action?: string
    })

    if (!token || typeof token !== "string") {
      return NextResponse.json(
        { success: false, "error-codes": ["missing-input-response"] },
        { status: 400 },
      )
    }

    const ipHeader = (request.headers.get("x-forwarded-for") || "").split(",")[0]?.trim()
    const userAgent = request.headers.get("user-agent") || undefined

    // Detect Enterprise configuration
    const enterpriseProjectId = process.env.RECAPTCHA_ENTERPRISE_PROJECT_ID
    const enterpriseApiKey = process.env.RECAPTCHA_ENTERPRISE_API_KEY
    const siteKey = process.env.RECAPTCHA_SITE_KEY || process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY

    if (enterpriseProjectId && enterpriseApiKey && siteKey) {
      // Use reCAPTCHA Enterprise: createAssessment
      const url = `https://recaptchaenterprise.googleapis.com/v1/projects/${encodeURIComponent(
        enterpriseProjectId,
      )}/assessments?key=${encodeURIComponent(enterpriseApiKey)}`
      const body = {
        event: {
          token,
          siteKey,
          expectedAction: action,
          userIpAddress: ipHeader || undefined,
          userAgent,
        },
      }
      const resp = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })
      const data = await resp.json()

      const valid = data?.tokenProperties?.valid === true
      const returnedAction: string | undefined = data?.tokenProperties?.action
      const score: number | undefined = data?.riskAnalysis?.score
      const reasons: string[] = Array.isArray(data?.riskAnalysis?.reasons) ? data.riskAnalysis.reasons : []

      if (!valid) {
        return NextResponse.json(
          {
            success: false,
            enterprise: true,
            score: score ?? null,
            action: returnedAction || null,
            reasons,
            "error-codes": [data?.tokenProperties?.invalidReason || "invalid-token"],
            tokenProperties: data?.tokenProperties,
          },
          { status: 400 },
        )
      }
      if (action && returnedAction && action !== returnedAction) {
        return NextResponse.json(
          {
            success: false,
            enterprise: true,
            score: score ?? null,
            action: returnedAction,
            reasons: ["bad-action"],
            "error-codes": ["bad-action"],
            tokenProperties: data?.tokenProperties,
          },
          { status: 400 },
        )
      }
      return NextResponse.json(
        {
          success: true,
          enterprise: true,
          score: score ?? null,
          action: returnedAction || null,
          reasons,
          tokenProperties: data?.tokenProperties,
        },
        { status: 200 },
      )
    }

    // Fallback: classic siteverify (non-Enterprise)
    const secret = process.env.RECAPTCHA_SECRET_KEY
    if (!secret) {
      return NextResponse.json(
        { success: false, "error-codes": ["server-misconfiguration"] },
        { status: 500 },
      )
    }
    const params = new URLSearchParams()
    params.set("secret", secret)
    params.set("response", token)
    if (ipHeader) params.set("remoteip", ipHeader)
    const resp = await fetch("https://www.google.com/recaptcha/api/siteverify", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: params.toString(),
    })
    const data = await resp.json()
    if (action && data?.action && action !== data.action) {
      return NextResponse.json(
        { ...data, success: false, "error-codes": ["bad-action"] },
        { status: 400 },
      )
    }
    return NextResponse.json(data, { status: data?.success ? 200 : 400 })
  } catch (_err) {
    return NextResponse.json(
      { success: false, "error-codes": ["internal-error"] },
      { status: 500 },
    )
  }
}
