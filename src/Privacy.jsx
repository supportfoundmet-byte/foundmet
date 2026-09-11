
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
            <span className="hero-badge mb-2">Privacy Policy</span>

            <h1 className="fw-bold mt-2">
              FoundMet Privacy Policy
            </h1>

            <p className="text-secondary small mb-1">
              Last Updated: September 11, 2026
            </p>

            <p className="text-secondary mt-3 mb-0">
              Your privacy matters to us. This Privacy Policy explains how
              FoundMet collects, uses, protects, and shares information when
              you use our platform to discover founders, connect with
              potential co-founders, communicate, and build startup
              relationships.
            </p>
          </div>

          <div className="text-secondary d-flex flex-column gap-4">

            {/* 1 */}
            <section>
              <h5 className="fw-bold text-main">
                1. Information We Collect
              </h5>

              <p className="small">
                When you create an account or use FoundMet, we may collect
                information that you voluntarily provide to us, including:
              </p>

              <ul className="small">
                <li>Name and display name</li>
                <li>Email address</li>
                <li>Profile photo</li>
                <li>Password or authentication information</li>
                <li>City or approximate location</li>
                <li>Startup idea or startup description</li>
                <li>Startup stage</li>
                <li>Skills and experience</li>
                <li>Roles or co-founder positions you are looking for</li>
                <li>Projects, interests, and professional information</li>
                <li>Optional mobile phone number</li>
                <li>Posts, images, messages, and other content you submit</li>
              </ul>

              <p className="small mb-0">
                We aim to collect only information that is reasonably
                necessary to provide and improve FoundMet.
              </p>
            </section>

            {/* 2 */}
            <section>
              <h5 className="fw-bold text-main">
                2. How We Use Your Information
              </h5>

              <p className="small">
                We may use your information to operate and improve FoundMet,
                including to:
              </p>

              <ul className="small">
                <li>Create and manage your account</li>
                <li>Display your founder profile to other users</li>
                <li>Help you discover potential co-founders</li>
                <li>Calculate approximate proximity between users</li>
                <li>Enable connection requests</li>
                <li>Enable messaging between accepted connections</li>
                <li>Process contact-sharing requests</li>
                <li>Display founder posts and community content</li>
                <li>Prevent spam, abuse, fraud, and unauthorized activity</li>
                <li>Maintain platform security</li>
                <li>Diagnose technical problems</li>
                <li>Improve our features and user experience</li>
                <li>Communicate important service-related information</li>
              </ul>
            </section>

            {/* 3 */}
            <section>
              <h5 className="fw-bold text-main">
                3. Founder Profiles and Public Information
              </h5>

              <p className="small mb-0">
                FoundMet is designed as a founder networking platform.
                Information that you choose to include in your public profile
                may be visible to other registered users. This may include
                your name, profile photo, city, startup information, skills,
                interests, experience, and other information that you
                voluntarily publish.
              </p>
            </section>

            {/* 4 */}
            <section>
              <h5 className="fw-bold text-main">
                4. Posts and Community Content
              </h5>

              <p className="small mb-0">
                If you publish a post, startup idea, project, image, or other
                community content, that information may be visible to other
                FoundMet users depending on the visibility settings and
                functionality of the platform.
              </p>

              <p className="small mb-0 mt-2">
                Please avoid publishing passwords, financial information,
                government identification numbers, private credentials, or
                other sensitive information in public posts.
              </p>
            </section>

            {/* 5 */}
            <section>
              <h5 className="fw-bold text-main">
                5. Proximity and Location Information
              </h5>

              <p className="small mb-0">
                FoundMet may use your city or approximate location to help
                identify potential founders in your area. For example, the
                platform may use approximate distance ranges such as
                "within 50–80 km" to improve founder discovery.
              </p>

              <p className="small mb-0 mt-2">
                FoundMet does not intend to publicly display your precise
                residential address or continuously broadcast your real-time
                GPS location to other users.
              </p>
            </section>

            {/* 6 */}
            <section>
              <h5 className="fw-bold text-main">
                6. Mobile Number Protection
              </h5>

              <p className="small mb-0">
                Your mobile phone number is treated as private information.
                It is not intended to be publicly displayed on your founder
                profile.
              </p>

              <p className="small mb-0 mt-2">
                Depending on the platform's connection and contact-sharing
                functionality, your number may only be shared with another
                user after the appropriate connection and contact-sharing
                permissions have been granted.
              </p>

              <p className="small mb-0 mt-2">
                Users should not attempt to bypass FoundMet's privacy
                controls to obtain another person's private contact
                information.
              </p>
            </section>

            {/* 7 */}
            <section>
              <h5 className="fw-bold text-main">
                7. Connections and Messaging
              </h5>

              <p className="small mb-0">
                FoundMet may allow users to send connection requests and
                communicate with accepted connections. Information shared
                through messages is provided by users and may be processed
                by FoundMet to deliver, secure, and maintain the messaging
                service.
              </p>

              <p className="small mb-0 mt-2">
                You should exercise reasonable judgment before sharing
                confidential business information, intellectual property,
                passwords, financial information, or other sensitive
                information with another user.
              </p>
            </section>

            {/* 8 */}
            <section>
              <h5 className="fw-bold text-main">
                8. Passwords and Account Security
              </h5>

              <p className="small mb-0">
                Passwords should be securely stored using appropriate
                security practices. We do not intentionally display your
                password to other users.
              </p>

              <p className="small mb-0 mt-2">
                You are responsible for keeping your account credentials
                confidential and for notifying us if you believe that your
                account has been accessed without authorization.
              </p>
            </section>

            {/* 9 */}
            <section>
              <h5 className="fw-bold text-main">
                9. Cookies and Technical Information
              </h5>

              <p className="small mb-0">
                FoundMet may use cookies, authentication tokens, local
                storage, logs, and similar technologies to keep users
                authenticated, maintain sessions, improve security, and
                understand technical problems.
              </p>

              <p className="small mb-0 mt-2">
                We may also collect technical information such as browser
                type, device information, IP address, operating system,
                timestamps, and basic interaction or error information.
              </p>
            </section>

            {/* 10 */}
            <section>
              <h5 className="fw-bold text-main">
                10. IP Addresses and Security Logs
              </h5>

              <p className="small mb-0">
                For security, abuse prevention, debugging, and operational
                purposes, FoundMet may record information such as IP
                addresses, login attempts, timestamps, and security events.
              </p>

              <p className="small mb-0 mt-2">
                Such information may be used to investigate suspicious
                activity, protect accounts, and maintain the reliability of
                the platform.
              </p>
            </section>

            {/* 11 */}
            <section>
              <h5 className="fw-bold text-main">
                11. How We Share Information
              </h5>

              <p className="small mb-0">
                We do not intend to sell your personal information as a
                product.
              </p>

              <p className="small mt-2">
                Information may be disclosed when reasonably necessary to:
              </p>

              <ul className="small">
                <li>Provide FoundMet services</li>
                <li>Operate hosting, database, storage, or infrastructure services</li>
                <li>Protect the security of the platform</li>
                <li>Investigate abuse, fraud, or violations of our policies</li>
                <li>Comply with applicable law or lawful requests</li>
                <li>Protect the rights and safety of FoundMet and its users</li>
              </ul>
            </section>

            {/* 12 */}
            <section>
              <h5 className="fw-bold text-main">
                12. Third-Party Services
              </h5>

              <p className="small mb-0">
                FoundMet may rely on third-party providers for services such
                as hosting, databases, authentication, image or file
                storage, analytics, email delivery, security, and other
                infrastructure.
              </p>

              <p className="small mb-0 mt-2">
                These providers may process information on our behalf as
                necessary to provide their services. We aim to work with
                providers that maintain reasonable security and privacy
                practices.
              </p>
            </section>

            {/* 13 */}
            <section>
              <h5 className="fw-bold text-main">
                13. Data Security
              </h5>

              <p className="small mb-0">
                We use reasonable technical and organizational measures to
                protect information from unauthorized access, alteration,
                disclosure, or destruction.
              </p>

              <p className="small mb-0 mt-2">
                However, no website, application, database, or internet
                transmission can be guaranteed to be completely secure.
                Therefore, we cannot guarantee absolute security.
              </p>
            </section>

            {/* 14 */}
            <section>
              <h5 className="fw-bold text-main">
                14. Data Retention
              </h5>

              <p className="small mb-0">
                We retain information for as long as reasonably necessary to
                provide FoundMet services, maintain security, comply with
                legal obligations, resolve disputes, enforce agreements, and
                maintain appropriate business records.
              </p>

              <p className="small mb-0 mt-2">
                When information is no longer reasonably required, we may
                delete or anonymize it, subject to applicable legal and
                operational requirements.
              </p>
            </section>

            {/* 15 */}
            <section>
              <h5 className="fw-bold text-main">
                15. Account Deletion
              </h5>

              <p className="small mb-0">
                You may request deletion of your FoundMet account and
                associated personal information through the available
                account functionality or by contacting us.
              </p>

              <p className="small mb-0 mt-2">
                Some information may need to be retained where required by
                law, necessary for security, fraud prevention, dispute
                resolution, or legitimate operational purposes.
              </p>
            </section>

            {/* 16 */}
            <section>
              <h5 className="fw-bold text-main">
                16. Your Responsibility
              </h5>

              <p className="small mb-0">
                You are responsible for the information you choose to publish
                on FoundMet. Before sharing information with another founder,
                consider whether it contains confidential business details,
                intellectual property, personal information, or other
                information that should not be publicly disclosed.
              </p>
            </section>

            {/* 17 */}
            <section>
              <h5 className="fw-bold text-main">
                17. Children's Privacy
              </h5>

              <p className="small mb-0">
                FoundMet is intended for users who are legally permitted to
                use the service. We do not knowingly collect personal
                information from children in violation of applicable law.
              </p>
            </section>

            {/* 18 */}
            <section>
              <h5 className="fw-bold text-main">
                18. Changes to This Privacy Policy
              </h5>

              <p className="small mb-0">
                We may update this Privacy Policy from time to time as
                FoundMet develops new features, changes its services, or as
                legal and regulatory requirements evolve.
              </p>

              <p className="small mb-0 mt-2">
                When we make material changes, we may update the "Last
                Updated" date displayed at the beginning of this policy.
              </p>
            </section>

            {/* 19 */}
            <section>
              <h5 className="fw-bold text-main">
                19. Contact Us
              </h5>

              <p className="small mb-0">
                If you have questions, concerns, privacy requests, or
                security-related issues regarding FoundMet, please contact
                the FoundMet team through the official contact channel
                provided on our platform.
              </p>
            </section>

            {/* Disclaimer */}
            <section className="border-top pt-4">
              <h5 className="fw-bold text-main">
                20. Important Notice
              </h5>

              <p className="small mb-0">
                FoundMet is a networking and collaboration platform designed
                to help founders discover and connect with potential
                co-founders. FoundMet does not guarantee that any user is
                genuine, trustworthy, qualified, or suitable for a particular
                business relationship.
              </p>

              <p className="small mb-0 mt-2">
                Users should independently verify information and exercise
                appropriate caution before entering into business
                relationships, sharing confidential information, transferring
                money, or signing agreements with another user.
              </p>
            </section>

            {/* Navigation */}
            <div className="border-top pt-4 mt-2 d-flex flex-column flex-md-row justify-content-between gap-2">
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

