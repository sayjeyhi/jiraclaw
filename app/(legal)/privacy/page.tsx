import Link from "next/link";
import { ArrowLeft, Grip } from "lucide-react";

export default function PrivacyPolicyPage() {
  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-12">
      <div className="mb-8 flex items-center gap-3">
        <Link
          href="/sign-in"
          className="text-muted-foreground hover:bg-accent hover:text-foreground flex size-8 items-center justify-center rounded-md transition-colors"
        >
          <ArrowLeft className="size-4" />
        </Link>
        <div className="flex items-center gap-2">
          <div className="bg-primary flex size-7 items-center justify-center rounded-md">
            <Grip className="text-primary-foreground size-3.5" />
          </div>
          <span className="text-foreground text-sm font-semibold tracking-tight">JiraClaw</span>
        </div>
      </div>

      <h1 className="text-foreground text-2xl font-bold tracking-tight">Privacy Policy</h1>
      <p className="text-muted-foreground mt-2 text-xs">Last updated: February 25, 2026</p>

      <div className="text-muted-foreground mt-8 flex flex-col gap-6 text-sm leading-relaxed">
        <section className="flex flex-col gap-2">
          <h2 className="text-foreground text-base font-semibold">1. Information We Collect</h2>
          <p>When you use JiraClaw, we may collect the following types of information:</p>
          <ul className="ml-4 list-disc space-y-1">
            <li>
              <span className="text-foreground font-medium">Account Information:</span> Name, email
              address, and profile picture from your Google or GitHub account.
            </li>
            <li>
              <span className="text-foreground font-medium">Usage Data:</span> Information about how
              you use the Service, including pages visited, features used, and interaction patterns.
            </li>
            <li>
              <span className="text-foreground font-medium">Integration Data:</span> Jira project
              metadata, repository information, and bot configuration data that you provide to the
              Service.
            </li>
            <li>
              <span className="text-foreground font-medium">Log Data:</span> System logs generated
              by your bots and integrations within the Service.
            </li>
          </ul>
        </section>

        <section className="flex flex-col gap-2">
          <h2 className="text-foreground text-base font-semibold">
            2. How We Use Your Information
          </h2>
          <p>We use collected information to:</p>
          <ul className="ml-4 list-disc space-y-1">
            <li>Provide, maintain, and improve the Service</li>
            <li>Authenticate your identity and manage your account</li>
            <li>Process your Jira and repository integrations</li>
            <li>Generate and manage AI-powered bot interactions</li>
            <li>Send you service-related notifications and updates</li>
            <li>Monitor and analyze usage trends to improve user experience</li>
          </ul>
        </section>

        <section className="flex flex-col gap-2">
          <h2 className="text-foreground text-base font-semibold">3. Data Sharing</h2>
          <p>
            We do not sell your personal information. We may share your data with third parties only
            in the following circumstances:
          </p>
          <ul className="ml-4 list-disc space-y-1">
            <li>With your explicit consent</li>
            <li>With AI service providers to process bot requests (e.g., OpenAI, Anthropic)</li>
            <li>With Atlassian/Jira to facilitate project integrations</li>
            <li>To comply with legal obligations or protect our rights</li>
          </ul>
        </section>

        <section className="flex flex-col gap-2">
          <h2 className="text-foreground text-base font-semibold">4. Data Security</h2>
          <p>
            We implement industry-standard security measures to protect your data, including
            encryption in transit and at rest, access controls, and regular security audits.
            However, no method of electronic storage is 100% secure.
          </p>
        </section>

        <section className="flex flex-col gap-2">
          <h2 className="text-foreground text-base font-semibold">5. Data Retention</h2>
          <p>
            We retain your account information for as long as your account is active. System logs
            are retained according to your subscription plan (7 days for Free, 30 days for Personal,
            unlimited for Team). You may request deletion of your account and associated data at any
            time.
          </p>
        </section>

        <section className="flex flex-col gap-2">
          <h2 className="text-foreground text-base font-semibold">6. Cookies and Tracking</h2>
          <p>
            We use essential cookies for authentication and session management. We do not use
            third-party tracking cookies or advertising networks.
          </p>
        </section>

        <section className="flex flex-col gap-2">
          <h2 className="text-foreground text-base font-semibold">7. Your Rights</h2>
          <p>Depending on your jurisdiction, you may have the right to:</p>
          <ul className="ml-4 list-disc space-y-1">
            <li>Access your personal data</li>
            <li>Correct inaccurate data</li>
            <li>Request deletion of your data</li>
            <li>Object to or restrict certain processing</li>
            <li>Data portability</li>
          </ul>
          <p>
            To exercise these rights, contact us at{" "}
            <span className="text-foreground font-medium">privacy@jiraclaw.ai</span>.
          </p>
        </section>

        <section className="flex flex-col gap-2">
          <h2 className="text-foreground text-base font-semibold">8. Children{"'"}s Privacy</h2>
          <p>
            The Service is not directed to individuals under 16. We do not knowingly collect
            personal information from children.
          </p>
        </section>

        <section className="flex flex-col gap-2">
          <h2 className="text-foreground text-base font-semibold">9. Changes to This Policy</h2>
          <p>
            We may update this Privacy Policy from time to time. We will notify you of material
            changes by posting the updated policy on the Service. Your continued use of the Service
            after changes constitutes acceptance.
          </p>
        </section>

        <section className="flex flex-col gap-2">
          <h2 className="text-foreground text-base font-semibold">10. Contact</h2>
          <p>
            If you have questions about this Privacy Policy, please contact us at{" "}
            <span className="text-foreground font-medium">privacy@jiraclaw.ai</span>.
          </p>
        </section>
      </div>

      <div className="border-border text-muted-foreground mt-8 border-t pt-6 text-xs">
        See also our{" "}
        <Link href="/terms" className="text-primary font-medium hover:underline">
          Terms of Service
        </Link>
        .
      </div>
    </div>
  );
}
