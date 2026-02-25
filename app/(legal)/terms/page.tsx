import Link from "next/link"
import { ArrowLeft, Grip } from "lucide-react"

export default function TermsOfServicePage() {
  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-12">
      <div className="mb-8 flex items-center gap-3">
        <Link
          href="/sign-in"
          className="flex size-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
        </Link>
        <div className="flex items-center gap-2">
          <div className="flex size-7 items-center justify-center rounded-md bg-primary">
            <Grip className="size-3.5 text-primary-foreground" />
          </div>
          <span className="text-sm font-semibold tracking-tight text-foreground">
            JiraClaw
          </span>
        </div>
      </div>

      <h1 className="text-2xl font-bold tracking-tight text-foreground">
        Terms of Service
      </h1>
      <p className="mt-2 text-xs text-muted-foreground">
        Last updated: February 25, 2026
      </p>

      <div className="mt-8 flex flex-col gap-6 text-sm leading-relaxed text-muted-foreground">
        <section className="flex flex-col gap-2">
          <h2 className="text-base font-semibold text-foreground">
            1. Acceptance of Terms
          </h2>
          <p>
            By accessing or using JiraClaw (&quot;the Service&quot;), you agree to be bound by these
            Terms of Service. If you do not agree to these terms, please do not use the
            Service.
          </p>
        </section>

        <section className="flex flex-col gap-2">
          <h2 className="text-base font-semibold text-foreground">
            2. Description of Service
          </h2>
          <p>
            JiraClaw is an AI-powered Jira automation platform that enables users to create
            bots, integrate with Jira projects, configure AI models, manage communication
            channels, and monitor system activity through logs.
          </p>
        </section>

        <section className="flex flex-col gap-2">
          <h2 className="text-base font-semibold text-foreground">
            3. User Accounts
          </h2>
          <p>
            You must create an account using a supported authentication provider (Google or
            GitHub) to use the Service. You are responsible for maintaining the security of
            your account credentials and for all activity that occurs under your account.
          </p>
        </section>

        <section className="flex flex-col gap-2">
          <h2 className="text-base font-semibold text-foreground">
            4. Acceptable Use
          </h2>
          <p>You agree not to use the Service to:</p>
          <ul className="ml-4 list-disc space-y-1">
            <li>Violate any applicable laws or regulations</li>
            <li>Infringe on the intellectual property rights of others</li>
            <li>Transmit harmful, offensive, or unauthorized content</li>
            <li>Attempt to gain unauthorized access to the Service or its systems</li>
            <li>Interfere with or disrupt the integrity of the Service</li>
          </ul>
        </section>

        <section className="flex flex-col gap-2">
          <h2 className="text-base font-semibold text-foreground">
            5. Subscription and Billing
          </h2>
          <p>
            Some features of the Service require a paid subscription. Billing occurs on a
            monthly basis. You may cancel your subscription at any time, and access will
            continue until the end of the current billing period. Refunds are not provided
            for partial billing periods.
          </p>
        </section>

        <section className="flex flex-col gap-2">
          <h2 className="text-base font-semibold text-foreground">
            6. Data and Privacy
          </h2>
          <p>
            Your use of the Service is also governed by our{" "}
            <Link href="/privacy" className="font-medium text-primary hover:underline">
              Privacy Policy
            </Link>
            . By using the Service, you consent to the collection and use of your
            information as described therein.
          </p>
        </section>

        <section className="flex flex-col gap-2">
          <h2 className="text-base font-semibold text-foreground">
            7. Intellectual Property
          </h2>
          <p>
            The Service, including its original content, features, and functionality, is
            owned by JiraClaw and is protected by international copyright, trademark, and
            other intellectual property laws.
          </p>
        </section>

        <section className="flex flex-col gap-2">
          <h2 className="text-base font-semibold text-foreground">
            8. Limitation of Liability
          </h2>
          <p>
            The Service is provided &quot;as is&quot; without warranties of any kind. In no event
            shall JiraClaw be liable for any indirect, incidental, special, consequential,
            or punitive damages arising from your use of the Service.
          </p>
        </section>

        <section className="flex flex-col gap-2">
          <h2 className="text-base font-semibold text-foreground">
            9. Termination
          </h2>
          <p>
            We may terminate or suspend your account at any time, without prior notice, for
            conduct that we believe violates these Terms or is harmful to other users, us,
            or third parties.
          </p>
        </section>

        <section className="flex flex-col gap-2">
          <h2 className="text-base font-semibold text-foreground">
            10. Changes to Terms
          </h2>
          <p>
            We reserve the right to modify these Terms at any time. We will notify users of
            material changes by posting the updated Terms on the Service. Your continued use
            of the Service after such changes constitutes acceptance of the new Terms.
          </p>
        </section>

        <section className="flex flex-col gap-2">
          <h2 className="text-base font-semibold text-foreground">
            11. Contact
          </h2>
          <p>
            If you have any questions about these Terms, please contact us at{" "}
            <span className="font-medium text-foreground">legal@jiraclaw.ai</span>.
          </p>
        </section>
      </div>
    </div>
  )
}
