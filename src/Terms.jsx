import { Link } from "react-router-dom";
import Header from "./components/Header.jsx";

export default function Terms() {
  return (
    <div className="min-vh-100 bg-background d-flex flex-column">
      <Header />

      <main
        className="container my-5 flex-grow-1"
        style={{ maxWidth: "900px" }}
      >
        <div className="card foundmet-card border-0 shadow-sm p-4 p-md-5">
          {/* Header */}
          <div className="mb-5">
            <span className="hero-badge mb-2">
              Legal & Community Trust
            </span>

            <h1 className="fw-bold mt-2">
              FoundMet Terms of Service
            </h1>

            <p className="text-secondary small mb-1">
              Effective Date: September 2026
            </p>

            <p className="text-secondary small mb-0">
              These Terms govern your access to and use of the FoundMet
              website, application, platform, features and services.
            </p>
          </div>

          <div className="text-secondary d-flex flex-column gap-4">

            {/* 1 */}
            <section>
              <h5 className="fw-bold text-main">
                1. About FoundMet
              </h5>

              <p className="small">
                FoundMet is a technology platform designed to help users
                discover and connect with potential co-founders, startup
                collaborators, professionals, builders and other people with
                complementary interests, skills or goals.
              </p>

              <p className="small mb-0">
                FoundMet facilitates introductions and communication between
                users. FoundMet does not itself become a co-founder, employer,
                investor, business partner or agent of any user merely because
                users connect through the platform.
              </p>
            </section>

            {/* 2 */}
            <section>
              <h5 className="fw-bold text-main">
                2. Acceptance of These Terms
              </h5>

              <p className="small mb-0">
                By accessing, registering for, or using FoundMet, you agree to
                these Terms of Service, our Privacy Policy, Cookie Policy and
                other applicable rules or policies displayed on the platform.
                If you do not agree with these Terms, you must not use FoundMet.
              </p>
            </section>

            {/* 3 */}
            <section>
              <h5 className="fw-bold text-main">
                3. Eligibility
              </h5>

              <p className="small">
                FoundMet is intended for individuals who are legally capable
                of entering into an agreement under applicable law.
              </p>

              <p className="small mb-0">
                Unless FoundMet expressly provides otherwise, you must be at
                least 18 years old to create and use an account. You must
                provide accurate information regarding your age and identity.
              </p>
            </section>

            {/* 4 */}
            <section>
              <h5 className="fw-bold text-main">
                4. Account Registration
              </h5>

              <p className="small">
                To use certain FoundMet features, you may be required to
                create an account and provide information such as your name,
                email address, phone number, professional information, skills,
                interests, location or other profile information.
              </p>

              <p className="small">
                You agree that information provided by you will be accurate,
                current and not misleading. You must update information when
                reasonably necessary to keep your profile accurate.
              </p>

              <p className="small mb-0">
                You are responsible for maintaining the confidentiality of
                your account credentials and for activities performed through
                your account, subject to applicable law.
              </p>
            </section>

            {/* 5 */}
            <section>
              <h5 className="fw-bold text-main">
                5. User Profiles and Authenticity
              </h5>

              <p className="small">
                Users must not impersonate another person, organization,
                company or public figure, or create deceptive or materially
                misleading profiles.
              </p>

              <p className="small mb-0">
                FoundMet may take reasonable measures to investigate reports,
                restrict visibility, suspend or remove profiles where there is
                a reasonable basis to believe that the profile violates these
                Terms, applicable law or platform safety requirements.
              </p>
            </section>

            {/* 6 */}
            <section>
              <h5 className="fw-bold text-main">
                6. User Content and Intellectual Property
              </h5>

              <p className="small">
                You retain ownership of original content that you lawfully
                submit to FoundMet, including profile information, descriptions,
                posts, messages and other material, subject to the rights
                granted in these Terms.
              </p>

              <p className="small">
                By submitting content to FoundMet, you grant FoundMet a
                non-exclusive, worldwide, limited licence to host, store,
                reproduce, process, display and transmit that content only as
                reasonably necessary to operate, maintain, secure and improve
                the FoundMet service.
              </p>

              <p className="small mb-0">
                This licence does not transfer ownership of your underlying
                intellectual property to FoundMet.
              </p>
            </section>

            {/* 7 */}
            <section>
              <h5 className="fw-bold text-main">
                7. Your Ideas, Intellectual Property and Confidential
                Information
              </h5>

              <p className="small">
                FoundMet does not claim ownership of your startup ideas,
                inventions, source code, business plans, pitch decks,
                trademarks, designs or other intellectual property merely
                because you upload, describe or discuss them on the platform.
              </p>

              <p className="small">
                However, you are responsible for deciding what information you
                disclose to other users. FoundMet does not guarantee that
                another user will keep information confidential or refrain from
                using information that you voluntarily disclose.
              </p>

              <p className="small mb-0">
                If information is commercially sensitive, you should consider
                appropriate confidentiality or intellectual-property protection
                before disclosing it.
              </p>
            </section>

            {/* 8 */}
            <section>
              <h5 className="fw-bold text-main">
                8. Connections and Introductions
              </h5>

              <p className="small">
                FoundMet provides tools that may allow users to discover
                profiles, send connection requests and communicate with other
                users.
              </p>

              <p className="small mb-0">
                A connection, match, message, introduction or profile
                recommendation does not constitute an endorsement, verification,
                employment offer, investment opportunity, partnership agreement
                or guarantee of compatibility.
              </p>
            </section>

            {/* 9 */}
            <section>
              <h5 className="fw-bold text-main">
                9. User-to-User Transactions and Relationships
              </h5>

              <p className="small">
                FoundMet is not a party to agreements, employment arrangements,
                investment arrangements, partnerships, equity arrangements or
                other transactions entered into directly between users.
              </p>

              <p className="small mb-0">
                Users are responsible for conducting their own due diligence
                before entering into any business, financial, employment or
                personal relationship with another user.
              </p>
            </section>

            {/* 10 */}
            <section>
              <h5 className="fw-bold text-main">
                10. Messaging and Communication
              </h5>

              <p className="small">
                FoundMet may provide real-time messaging and communication
                features for legitimate networking and collaboration.
              </p>

              <p className="small mb-0">
                Users must not use messaging features for spam, harassment,
                threats, fraud, phishing, unauthorized advertising, malicious
                links, credential theft, unlawful solicitation or other
                abusive activity.
              </p>
            </section>

            {/* 11 */}
            <section>
              <h5 className="fw-bold text-main">
                11. Prohibited Activities
              </h5>

              <p className="small">
                You must not use FoundMet to:
              </p>

              <ul className="small">
                <li>impersonate another person or organization;</li>
                <li>
                  create fraudulent, deceptive or materially misleading
                  profiles;
                </li>
                <li>harass, threaten or intimidate another person;</li>
                <li>send spam or unauthorized promotional messages;</li>
                <li>conduct phishing, fraud or other deceptive schemes;</li>
                <li>
                  distribute malware, malicious code or harmful software;
                </li>
                <li>
                  attempt unauthorized access to FoundMet accounts or systems;
                </li>
                <li>
                  scrape, copy or systematically collect user information
                  without authorization;
                </li>
                <li>
                  infringe intellectual-property, privacy or other legal
                  rights;
                </li>
                <li>
                  upload or distribute unlawful or harmful content;
                </li>
                <li>
                  exploit or endanger children or vulnerable persons; or
                </li>
                <li>
                  interfere with the normal operation or security of FoundMet.
                </li>
              </ul>
            </section>

            {/* 12 */}
            <section>
              <h5 className="fw-bold text-main">
                12. Reporting Abuse, Bugs and Violations
              </h5>

              <p className="small">
                Users may report suspected abuse, security problems,
                inappropriate content, impersonation, account problems or
                technical issues through the reporting mechanisms provided by
                FoundMet.
              </p>

              <p className="small mb-0">
                FoundMet may review reports and take appropriate action,
                including restricting content, limiting features, suspending
                accounts or permanently removing accounts where permitted by
                applicable law.
              </p>
            </section>

            {/* 13 */}
            <section>
              <h5 className="fw-bold text-main">
                13. Privacy and Personal Data
              </h5>

              <p className="small">
                FoundMet may process personal data in connection with providing
                and securing the platform. The categories of data collected,
                purposes of processing, retention practices, user rights and
                available privacy controls are described in our Privacy Policy.
              </p>

              <p className="small mb-0">
                FoundMet will handle personal data in accordance with applicable
                Indian data-protection requirements and other applicable law.
                Where consent is the applicable basis for processing, users may
                have rights concerning withdrawal of consent and other
                applicable data-protection rights.
              </p>
            </section>

            {/* 14 */}
            <section>
              <h5 className="fw-bold text-main">
                14. Security
              </h5>

              <p className="small">
                FoundMet uses reasonable technical and organizational measures
                intended to protect accounts, systems and personal data against
                unauthorized access, misuse, alteration, disclosure or
                destruction.
              </p>

              <p className="small mb-0">
                However, no internet-based service can guarantee absolute
                security. Users should use strong, unique passwords, protect
                authentication information and promptly report suspected
                unauthorized access.
              </p>
            </section>

            {/* 15 */}
            <section>
              <h5 className="fw-bold text-main">
                15. Cookies and Local Storage
              </h5>

              <p className="small mb-0">
                FoundMet may use cookies, local storage, session storage or
                similar technologies for authentication, security, preferences,
                functionality and other purposes described in the applicable
                Privacy or Cookie Policy.
              </p>
            </section>

            {/* 16 */}
            <section>
              <h5 className="fw-bold text-main">
                16. Third-Party Services
              </h5>

              <p className="small mb-0">
                FoundMet may rely on third-party infrastructure, authentication,
                hosting, analytics, communication, storage or other service
                providers. Their services may be governed by their own terms
                and privacy policies. FoundMet is not responsible for the
                independent operation of third-party services except as required
                by applicable law.
              </p>
            </section>

            {/* 17 */}
            <section>
              <h5 className="fw-bold text-main">
                17. Service Availability
              </h5>

              <p className="small mb-0">
                FoundMet is provided on an evolving technology platform.
                Features may be modified, temporarily unavailable, discontinued
                or restricted for maintenance, security, technical,
                operational or legal reasons. We do not guarantee uninterrupted
                or error-free availability.
              </p>
            </section>

            {/* 18 */}
            <section>
              <h5 className="fw-bold text-main">
                18. No Guarantee of Results
              </h5>

              <p className="small mb-0">
                FoundMet does not guarantee that you will find a co-founder,
                employee, investor, customer, business partner, employment,
                funding, investment, revenue or any particular business
                outcome through the platform.
              </p>
            </section>

            {/* 19 */}
            <section>
              <h5 className="fw-bold text-main">
                19. User Verification and Due Diligence
              </h5>

              <p className="small mb-0">
                Unless expressly stated otherwise, FoundMet does not guarantee
                the identity, qualifications, experience, financial position,
                employment history, business claims, credentials or intentions
                of another user. Users should independently verify information
                before relying upon it.
              </p>
            </section>

            {/* 20 */}
            <section>
              <h5 className="fw-bold text-main">
                20. Suspension, Restriction and Termination
              </h5>

              <p className="small">
                You may stop using FoundMet at any time and may request account
                closure through the available account or support mechanisms.
              </p>

              <p className="small mb-0">
                FoundMet may suspend, restrict or terminate an account where
                reasonably necessary to protect users, the platform or
                third parties, to investigate suspected violations, to comply
                with law, or where continued access creates a security,
                legal or operational risk.
              </p>
            </section>

            {/* 21 */}
            <section>
              <h5 className="fw-bold text-main">
                21. Account Deletion and Data Retention
              </h5>

              <p className="small mb-0">
                When an account is deleted, FoundMet may delete or anonymize
                associated personal data in accordance with its applicable
                retention practices, legal obligations, security requirements,
                dispute resolution needs and Privacy Policy. Certain
                information may therefore need to be retained where required
                or permitted by applicable law.
              </p>
            </section>

            {/* 22 */}
            <section>
              <h5 className="fw-bold text-main">
                22. Disclaimers
              </h5>

              <p className="small">
                To the maximum extent permitted by applicable law, FoundMet is
                provided on an "as available" basis. FoundMet does not warrant
                that the platform will always be uninterrupted, completely
                secure, error-free or that information provided by users will
                always be accurate or complete.
              </p>

              <p className="small mb-0">
                Nothing in these Terms excludes or limits any liability,
                warranty, consumer right or statutory protection that cannot
                lawfully be excluded or limited under applicable Indian law.
              </p>
            </section>

            {/* 23 */}
            <section>
              <h5 className="fw-bold text-main">
                23. Limitation of Liability
              </h5>

              <p className="small mb-0">
                To the maximum extent permitted by applicable law, FoundMet
                shall not be responsible for indirect, incidental, special,
                consequential or loss-of-profit damages arising from your use
                of or inability to use the platform. Nothing in these Terms is
                intended to exclude liability that cannot legally be excluded
                under applicable law.
              </p>
            </section>

            {/* 24 */}
            <section>
              <h5 className="fw-bold text-main">
                24. Indemnity
              </h5>

              <p className="small mb-0">
                To the extent permitted by applicable law, you agree to
                reasonably indemnify and hold FoundMet harmless from claims,
                losses, liabilities and expenses arising from your unlawful use
                of the platform, your violation of these Terms, or your
                infringement of another person's rights.
              </p>
            </section>

            {/* 25 */}
            <section>
              <h5 className="fw-bold text-main">
                25. Governing Law and Jurisdiction
              </h5>

              <p className="small mb-0">
                These Terms are governed by the laws applicable in India,
                without prejudice to mandatory rights and protections available
                to users under applicable law. Subject to applicable law, courts
                having appropriate jurisdiction in India shall have jurisdiction
                over disputes relating to these Terms or the FoundMet service.
              </p>
            </section>

            {/* 26 */}
            <section>
              <h5 className="fw-bold text-main">
                26. Changes to These Terms
              </h5>

              <p className="small mb-0">
                FoundMet may update these Terms when the service, technology,
                business model or applicable legal requirements change. The
                updated version will be published on this page with a revised
                effective date. Where required by law, FoundMet will provide
                additional notice or obtain any required consent.
              </p>
            </section>

            {/* 27 */}
            <section>
              <h5 className="fw-bold text-main">
                27. Contact and Grievances
              </h5>

              <p className="small">
                For questions, complaints, account concerns, privacy-related
                requests or reports concerning the FoundMet service, contact:
              </p>

              <div className="small">
                <strong className="text-main">
                  FoundMet Support
                </strong>
                <br />

                Email:{" "}
                <a
                  href="mailto:supportfoundmet@gmail.com"
                  className="text-primary text-decoration-none"
                >
                  supportfoundmet@gmail.com
                </a>
              </div>

              <p className="small mb-0 mt-2">
                FoundMet will handle complaints and requests through its
                designated support/grievance mechanism in accordance with
                applicable law.
              </p>
            </section>

            {/* Final Notice */}
            <section className="border-top pt-4 mt-2">
              <div className="alert alert-light border small mb-0">
                <strong className="text-main">
                  Important:
                </strong>{" "}
                These Terms are intended to establish the rules for using
                FoundMet. They do not replace the FoundMet Privacy Policy,
                Cookie Policy or any other legally required notice. If a
                provision of these Terms conflicts with a mandatory requirement
                of applicable law, that mandatory requirement will prevail to
                the extent of the conflict.
              </div>
            </section>

            {/* Navigation */}
            <div className="border-top pt-4 mt-2 d-flex flex-column flex-sm-row justify-content-between align-items-center gap-2">
              <Link
                to="/register"
                className="btn btn-foundmet rounded-pill px-4"
              >
                Back to Registration
              </Link>

              <div className="d-flex gap-2">
                <Link
                  to="/privacy"
                  className="btn btn-outline-secondary rounded-pill px-4"
                >
                  Privacy Policy
                </Link>

                <Link
                  to="/explore"
                  className="btn btn-outline-primary rounded-pill px-4"
                >
                  Explore Founders
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}