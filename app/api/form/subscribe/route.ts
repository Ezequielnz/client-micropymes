import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const { email, token, action, form_name } = (await request.json()) as {
      email?: string
      token?: string
      action?: string
      form_name?: string
    }

    if (!email || typeof email !== "string") {
      return NextResponse.json({ ok: false, error: "missing-email" }, { status: 400 })
    }
    if (!token || typeof token !== "string") {
      return NextResponse.json({ ok: false, error: "missing-recaptcha" }, { status: 400 })
    }

    const expectsRecaptcha = String(process.env.FORMSPREE_EXPECTS_RECAPTCHA || "false").toLowerCase() === "true"

    // Build absolute origin for internal call
    const host = request.headers.get("x-forwarded-host") || request.headers.get("host")
    const proto = request.headers.get("x-forwarded-proto") || "http"
    const origin = host ? `${proto}://${host}` : "http://localhost:3000"

    if (!expectsRecaptcha) {
      const verifyResp = await fetch(`${origin}/api/recaptcha/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, action }),
      })
      const verifyData = await verifyResp.json().catch(() => ({}))
      const verify = { ok: verifyResp.ok, data: verifyData }
      if (!verify.ok || !verify.data?.success) {
        return NextResponse.json(
          { ok: false, error: "recaptcha-failed", details: verify.data ?? null },
          { status: 400 },
        )
      }
    }

    const FORM_ID = process.env.FORMSPREE_FORM_ID || "xyzdqrow"
    const url = `https://formspree.io/f/${encodeURIComponent(FORM_ID)}`
    const referer = request.headers.get("referer") || `${origin}/`

    const body = new URLSearchParams()
    body.set("email", email)
    body.set("form_name", form_name || action || "subscribe")
    if (expectsRecaptcha) {
      // Forward token so Formspree can validate reCAPTCHA on their side
      body.set("g-recaptcha-response", token)
    }

    const fsResp = await fetch(url, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/x-www-form-urlencoded",
        Referer: referer,
        Origin: origin,
      },
      body: body.toString(),
    })

    const fsData = await fsResp.json().catch(() => ({}))

    if (!fsResp.ok) {
      return NextResponse.json(
        { ok: false, error: "formspree-error", details: fsData },
        { status: 400 },
      )
    }

    return NextResponse.json({ ok: true, formspree: fsData })
  } catch (err) {
    return NextResponse.json({ ok: false, error: "internal-error" }, { status: 500 })
  }
}
