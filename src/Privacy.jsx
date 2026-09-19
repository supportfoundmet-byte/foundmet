
import { Link } from "react-router-dom";
import Header from "./components/Header.jsx";

export default function Privacy() {
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
              Privacy, Security & Intellectual Property
            </span>

            <h1 className="fw-bold mt-2">
              FoundMet Privacy Policy
            </h1>

            <p className="text-secondary small mb-1">
              Last Updated: September 2026
            </p>

            <p className="text-secondary mt-3 mb-0">
              Your privacy, security, and trust matter to us. This Privacy
              Policy explains how FoundMet collects, uses, protects, stores,
              and shares information when you use our platform to discover
              founders, connect with professionals, communicate, and build
              startup relationships.
            </p>
          </div>

          <div className="text-secondary d-flex flex-column gap-4">

            {/* 1 */}
            <section>
              <h5 className="fw-bold text-main">
                1. About This Privacy Policy
              </h5>

              <p className="small mb-0">
                This Privacy Policy explains how information is handled when
                you access or use FoundMet, including our website,
                applications, accounts, profiles, messaging systems,
                connection features, and other services provided through the
                FoundMet platform.
              </p>
            </section>

            {/* 2 */}
            <section>
              <h5 className="fw-bold text-main">
                2. Information We Collect
              </h5>

              <p className="small">
                Depending on how you use FoundMet, we may collect information
                that you voluntarily provide, information generated through
                your use of the platform, and technical/security information.
              </p>

              <ul className="small">
                <li>Name and display name</li>
                <li>Email address</li>
                <li>Profile photo</li>
                <li>Authentication and account information</li>
                <li>City or approximate location</li>
                <li>Startup idea or startup description</li>
                <li>Startup stage</li>
                <li>Skills and experience</li>
                <li>Roles or positions you are looking for</li>
                <li>Projects and professional information</li>
                <li>Interests and profile preferences</li>
                <li>Optional mobile phone number</li>
                <li>Posts, images and other content you submit</li>
                <li>Messages and communications made through FoundMet</li>
                <li>Technical and security information</li>
              </ul>

              <p className="small mb-0">
                We aim to collect information that is reasonably necessary
                for providing, securing, maintaining, and improving FoundMet.
              </p>
            </section>

            {/* 3 */}
            <section>
              <h5 className="fw-bold text-main">
                3. How We Use Your Information
              </h5>

              <p className="small">
                We may process information for purposes including:
              </p>

              <ul className="small">
                <li>Creating and managing your FoundMet account</li>
                <li>Creating and displaying your founder profile</li>
                <li>Helping you discover potential collaborators</li>
                <li>Calculating approximate proximity between users</li>
                <li>Enabling connection requests</li>
                <li>Enabling messaging between users</li>
                <li>Processing contact-sharing requests</li>
                <li>Displaying community content</li>
                <li>Preventing spam, fraud and abuse</li>
                <li>Detecting suspicious or unauthorized activity</li>
                <li>Maintaining platform and account security</li>
                <li>Debugging and fixing technical problems</li>
                <li>Improving features and user experience</li>
                <li>Communicating important service information</li>
                <li>Complying with applicable legal obligations</li>
              </ul>
            </section>

            {/* 4 */}
            <section>
              <h5 className="fw-bold text-main">
                4. Founder Profiles and Information Visible to Users
              </h5>

              <p className="small mb-0">
                FoundMet is a networking platform. Information that you
                voluntarily include in your profile may be visible to other
                registered users depending on the functionality and visibility
                settings of the platform.
              </p>

              <p className="small mt-2 mb-0">
                This may include your name, profile photo, city, startup
                information, skills, interests, experience, professional
                information, and other information that you choose to publish.
              </p>
            </section>

            {/* 5 */}
            <section>
              <h5 className="fw-bold text-main">
                5. Startup Ideas and Confidential Information
              </h5>

              <p className="small">
                FoundMet may allow users to describe startup ideas, projects,
                businesses, skills, experience, or other professional
                information.
              </p>

              <p className="small">
                You should carefully consider what information you publish.
                FoundMet cannot guarantee that another user will keep
                information confidential after you voluntarily disclose it to
                that user.
              </p>

              <p className="small mb-0">
                If an idea, business plan, source code, invention, trade secret,
                strategy, customer information, or other information is
                confidential or commercially sensitive, you should consider
                appropriate legal and technical protections before disclosing
                it.
              </p>
            </section>

            {/* 6 */}
            <section>
              <h5 className="fw-bold text-main">
                6. Your Intellectual Property
              </h5>

              <p className="small">
                Subject to applicable law and any separate agreement between
                you and FoundMet, FoundMet does not claim ownership of your
                original startup ideas, source code, business plans, documents,
                designs, inventions, trademarks, or other intellectual
                property merely because you submit or describe them through
                the platform.
              </p>

              <p className="small mb-0">
                Your use of FoundMet does not automatically transfer ownership
                of your intellectual property to FoundMet.
              </p>
            </section>

            {/* 7 */}
            <section>
              <h5 className="fw-bold text-main">
                7. FoundMet Name, Logo, Brand and Platform Intellectual
                Property
              </h5>

              <p className="small">
                The FoundMet name, logo, branding, visual identity, website
                design, application interface, software, source code,
                databases, platform architecture, graphics, text, trademarks,
                service marks, and other materials created or provided by
                FoundMet are owned by or licensed to FoundMet, except where
                otherwise stated.
              </p>

              <p className="small mb-0">
                Nothing in these Terms grants you ownership or an unrestricted
                licence to copy, reproduce, modify, distribute, sell,
                commercialize, reverse engineer, impersonate, or otherwise
                exploit FoundMet's intellectual property without appropriate
                authorization.
              </p>
            </section>

            {/* 8 */}
            <section>
              <h5 className="fw-bold text-main">
                8. Unauthorized Access, Scraping and Data Extraction
              </h5>

              <p className="small">
                You must not attempt to obtain unauthorized access to FoundMet
                systems, accounts, databases, APIs, source code, infrastructure
                or security mechanisms.
              </p>

              <p className="small">
                Unauthorized scraping, automated extraction, bulk copying,
                harvesting of user information, database extraction, reverse
                engineering, credential attacks, circumvention of access
                controls, or attempts to reproduce substantial parts of the
                FoundMet platform are prohibited.
              </p>

              <p className="small mb-0">
                FoundMet may investigate suspected unauthorized activity,
                preserve relevant security information, restrict or terminate
                accounts, and take appropriate civil, criminal, regulatory or
                other legal action or make reports to appropriate authorities
                where permitted or required by applicable Indian law.
              </p>
            </section>

            {/* 9 */}
            <section>
              <h5 className="fw-bold text-main">
                9. Misuse of FoundMet Name or Logo
              </h5>

              <p className="small">
                No person may represent themselves as FoundMet, falsely claim
                to be associated with FoundMet, or use the FoundMet name,
                logo, branding, domain identity, or other protected brand
                elements in a misleading manner.
              </p>

              <p className="small mb-0">
                Unauthorized copying, impersonation, passing off, misleading
                use, or other infringement of FoundMet intellectual property
                may result in platform enforcement and may be pursued through
                appropriate legal remedies available under applicable law.
              </p>
            </section>

            {/* 10 */}
            <section>
              <h5 className="fw-bold text-main">
                10. Posts and Community Content
              </h5>

              <p className="small">
                If you publish a post, startup description, project,
                photograph, message, or other content, that information may be
                visible to other users according to the functionality and
                visibility settings of the platform.
              </p>

              <p className="small mb-0">
                Do not publish passwords, authentication credentials, financial
                information, government identification numbers, confidential
                documents, or other sensitive information in publicly visible
                areas.
              </p>
            </section>

            {/* 11 */}
            <section>
              <h5 className="fw-bold text-main">
                11. Location and Proximity Information
              </h5>

              <p className="small">
                FoundMet may use city-level or approximate location information
                to help users discover potential founders or collaborators
                nearby.
              </p>

              <p className="small mb-0">
                For example, FoundMet may use approximate distance ranges such
                as 50–80 km for discovery. FoundMet does not intend to publicly
                display your precise residential address or continuously
                broadcast your real-time GPS location to other users.
              </p>
            </section>

            {/* 12 */}
            <section>
              <h5 className="fw-bold text-main">
                12. Mobile Number Protection
              </h5>

              <p className="small">
                Your mobile number is treated as private account information
                and is not intended to be publicly displayed on your profile.
              </p>

              <p className="small mb-0">
                Where contact-sharing functionality is available, your number
                may only be shared through the applicable FoundMet permission
                or request process. Attempting to bypass these controls to
                obtain another user's private contact information is
                prohibited.
              </p>
            </section>

            {/* 13 */}
            <section>
              <h5 className="fw-bold text-main">
                13. Connections and Messaging
              </h5>

              <p className="small">
                FoundMet may allow users to send connection requests and
                communicate with accepted connections.
              </p>

              <p className="small mb-0">
                Messages may be processed by FoundMet as necessary to deliver,
                secure, maintain, moderate, investigate abuse, and operate the
                messaging service, subject to applicable law and our policies.
              </p>
            </section>

            {/* 14 */}
            <section>
              <h5 className="fw-bold text-main">
                14. Technical, Device and Security Information
              </h5>

              <p className="small">
                We may collect technical information such as IP address,
                browser type, operating system, device information, timestamps,
                login attempts, error information, authentication events,
                security events, and other information reasonably required to
                operate and protect the platform.
              </p>

              <p className="small mb-0">
                Security information may be used to detect suspicious
                activity, investigate unauthorized access, prevent abuse,
                protect accounts, troubleshoot problems, and maintain platform
                reliability.
              </p>
            </section>

            {/* 15 */}
            <section>
              <h5 className="fw-bold text-main">
                15. Cookies, Local Storage and Similar Technologies
              </h5>

              <p className="small mb-0">
                FoundMet may use cookies, local storage, session storage,
                authentication mechanisms, logs, and similar technologies to
                maintain sessions, remember preferences, provide functionality,
                improve security, and diagnose technical problems.
              </p>
            </section>

            {/* 16 */}
            <section>
              <h5 className="fw-bold text-main">
                16. How We Share Information
              </h5>

              <p className="small">
                FoundMet does not intend to sell personal information as a
                product.
              </p>

              <p className="small">
                Information may be disclosed where reasonably necessary to:
              </p>

              <ul className="small">
                <li>Provide and operate FoundMet services</li>
                <li>Operate hosting and infrastructure</li>
                <li>Provide database and storage services</li>
                <li>Maintain security and prevent abuse</li>
                <li>Investigate fraud or policy violations</li>
                <li>Respond to lawful requests</li>
                <li>Comply with applicable legal obligations</li>
                <li>Protect FoundMet, users, or third parties</li>
              </ul>
            </section>

            {/* 17 */}
            <section>
              <h5 className="fw-bold text-main">
                17. Third-Party Service Providers
              </h5>

              <p className="small">
                FoundMet may use third-party providers for hosting, cloud
                infrastructure, databases, authentication, storage, email,
                analytics, security, communication, and other technical
                services.
              </p>

              <p className="small mb-0">
                Such providers may process information on behalf of FoundMet
                where necessary to provide their services. We seek to use
                appropriate providers and security measures consistent with
                applicable requirements.
              </p>
            </section>

            {/* 18 */}
            <section>
              <h5 className="fw-bold text-main">
                18. Data Security
              </h5>

              <p className="small">
                FoundMet uses reasonable technical and organizational
                safeguards intended to protect personal information and
                platform systems against unauthorized access, misuse,
                alteration, disclosure, or destruction.
              </p>

              <p className="small mb-0">
                However, no internet service, database, application, or
                electronic transmission can be guaranteed to be completely
                secure. Therefore, we cannot promise absolute security.
              </p>
            </section>

            {/* 19 */}
            <section>
              <h5 className="fw-bold text-main">
                19. Data Retention
              </h5>

              <p className="small mb-0">
                We may retain information for as long as reasonably necessary
                to provide the service, maintain security, prevent abuse,
                resolve disputes, comply with legal obligations, enforce our
                agreements, and maintain appropriate business records.
              </p>
            </section>

            {/* 20 */}
            <section>
              <h5 className="fw-bold text-main">
                20. Account Deletion and Data Deletion
              </h5>

              <p className="small">
                Users may request account deletion through available FoundMet
                functionality or by contacting our support team.
              </p>

              <p className="small mb-0">
                Where applicable, personal information may be deleted,
                anonymized, or otherwise handled according to our retention
                obligations and applicable law. Certain information may need to
                be retained for legal, security, fraud-prevention, dispute
                resolution, or other lawful purposes.
              </p>
            </section>

            {/* 21 */}
            <section>
              <h5 className="fw-bold text-main">
                21. Data Protection Rights
              </h5>

              <p className="small">
                Subject to applicable Indian data-protection law, users may
                have rights relating to their personal data, including rights
                concerning access to information, correction, deletion,
                withdrawal of consent where consent is the applicable basis,
                and grievance redressal.
              </p>

              <p className="small mb-0">
                Requests may be submitted through our official support channel.
                We may take reasonable steps to verify the identity of the
                requester before processing certain requests.
              </p>
            </section>

            {/* 22 */}
            <section>
              <h5 className="fw-bold text-main">
                22. Children's Privacy
              </h5>

              <p className="small mb-0">
                FoundMet is intended for users aged 18 years or older unless
                FoundMet expressly provides otherwise in accordance with
                applicable law. We do not knowingly process children's personal
                data contrary to applicable legal requirements.
              </p>
            </section>

            {/* 23 */}
            <section>
              <h5 className="fw-bold text-main">
                23. Security Incidents and Unauthorized Access
              </h5>

              <p className="small">
                If we become aware of a security incident affecting personal
                data, FoundMet may take reasonable steps to investigate,
                contain, remediate, and notify relevant persons or authorities
                where required by applicable law.
              </p>

              <p className="small mb-0">
                Users should immediately report suspected unauthorized account
                access, data exposure, phishing, impersonation, or security
                vulnerabilities to FoundMet through our official support
                channel.
              </p>
            </section>

            {/* 24 */}
            <section>
              <h5 className="fw-bold text-main">
                24. Legal Protection of FoundMet's Platform and Assets
              </h5>

              <p className="small">
                FoundMet takes unauthorized access, data theft, scraping,
                source-code extraction, database extraction, credential
                attacks, impersonation, unauthorized commercial copying, and
                misuse of the FoundMet name or logo seriously.
              </p>

              <p className="small">
                Where appropriate, FoundMet may collect and preserve relevant
                technical and security records, restrict accounts, terminate
                access, issue notices, cooperate with lawful investigations,
                and pursue available legal remedies.
              </p>

              <p className="small mb-0">
                Depending on the conduct and applicable law, unauthorized
                activity may give rise to civil, criminal, regulatory, or
                contractual consequences. This section does not create new
                criminal offences or guarantee that any particular legal
                remedy will apply to a particular incident.
              </p>
            </section>

            {/* 25 */}
            <section>
              <h5 className="fw-bold text-main">
                25. Third-Party Intellectual Property
              </h5>

              <p className="small mb-0">
                Users must not upload, publish, reproduce, or distribute
                content that infringes another person's copyright, trademark,
                patent, trade secret, privacy, publicity, or other legal
                rights. FoundMet may take appropriate action upon receiving a
                valid complaint or becoming aware of an apparent violation.
              </p>
            </section>

            {/* 26 */}
            <section>
              <h5 className="fw-bold text-main">
                26. Legal Requests and Disclosure
              </h5>

              <p className="small mb-0">
                FoundMet may disclose information when required or permitted by
                applicable law, lawful government or law-enforcement requests,
                court orders, or where reasonably necessary to protect the
                rights, safety, security, and property of FoundMet, its users,
                or others.
              </p>
            </section>

            {/* 27 */}
            <section>
              <h5 className="fw-bold text-main">
                27. Changes to This Privacy Policy
              </h5>

              <p className="small mb-0">
                FoundMet may update this Privacy Policy as the platform,
                technology, business model, or applicable legal requirements
                evolve. We may update the "Last Updated" date and, where
                required, provide additional notice or obtain consent for
                material changes.
              </p>
            </section>

            {/* 28 */}
            <section>
              <h5 className="fw-bold text-main">
                28. Contact, Privacy Requests and Security Reports
              </h5>

              <p className="small">
                For privacy questions, account concerns, data requests,
                security reports, suspected data misuse, impersonation,
                unauthorized copying, or other concerns, contact:
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

              <p className="small mt-2 mb-0">
                Please provide sufficient information for us to understand and
                investigate your request or report.
              </p>
            </section>

            {/* Important Notice */}
            <section className="border-top pt-4">
              <div className="alert alert-light border small mb-0">
                <strong className="text-main">
                  Important Legal Notice:
                </strong>{" "}
                This Privacy Policy describes FoundMet's intended privacy and
                security practices and should be read together with the
                FoundMet Terms of Service and Cookie Policy. It does not create
                rights or obligations beyond those provided by applicable law.
                Where mandatory Indian law provides a different requirement,
                the applicable law will prevail.
              </div>
            </section>

            {/* Navigation */}
            <div className="border-top pt-4 mt-2 d-flex flex-column flex-md-row justify-content-between gap-2">
              <Link
                to="/terms"
                className="btn btn-outline-secondary rounded-pill px-4"
              >
                Terms & Conditions
              </Link>

              <Link
                to="/register"
                className="btn btn-foundmet rounded-pill px-4"
              >
                Back to Registration
              </Link>

              <Link
                to="/"
                className="btn btn-outline-primary rounded-pill px-4"
              >
                Back to Home
              </Link>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}
