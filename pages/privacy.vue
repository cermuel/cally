<script setup lang="ts">
useSeoMeta({
  title: "Privacy Policy | Cally",
  description:
    "Learn what information Cally collects, how it is used, and the choices available to you.",
});
</script>

<template>
  <UiLegalPage
    title="Privacy Policy"
    description="This policy explains what information Cally collects, why we use it, and the choices available to you."
  >
    <section>
      <h2>1. Information we collect</h2>
      <p>
        We collect information you provide when you create or manage an account,
        including your name, email address, password, username, profile details,
        availability, and profile image. If you sign in with Google, we receive
        the basic account information Google shares with us.
      </p>
      <p>
        When someone books a meeting, we collect the information needed to
        arrange it, such as attendee names and email addresses, guest details,
        meeting notes, selected times, time zones, and attendance status.
      </p>
      <p>
        We also process basic technical information generated when the service is
        used, such as device and browser information, IP address, request logs,
        and authentication or preference data stored in cookies and browser
        storage.
      </p>
    </section>

    <section>
      <h2>2. How we use information</h2>
      <p>We use this information to:</p>
      <ul>
        <li>provide, secure, maintain, and improve Cally;</li>
        <li>create accounts and public booking pages;</li>
        <li>check availability and schedule, update, or cancel meetings;</li>
        <li>send verification, booking, and service-related messages;</li>
        <li>respond to support requests and prevent misuse; and</li>
        <li>meet legal obligations and enforce our terms.</li>
      </ul>
    </section>

    <section>
      <h2>3. Google Calendar and Google account data</h2>
      <p>
        If you connect Google Calendar, Cally uses the access you authorise to
        check busy times, add or update calendar events, and create meeting
        details such as Google Meet links. If you use Google to sign in, we use
        the account data Google provides to authenticate you and set up your
        Cally account.
      </p>
      <p>
        Cally's use and transfer of information received from Google APIs follows
        the
        <a href="https://developers.google.com/terms/api-services-user-data-policy">
          Google API Services User Data Policy</a
        >, including its Limited Use requirements. You can revoke Cally's access
        at any time from your Google account permissions.
      </p>
    </section>

    <section>
      <h2>4. When information is shared</h2>
      <p>
        We share information only where needed to operate the service: with the
        host and attendees involved in a booking, with connected calendar and
        authentication providers at your direction, and with service providers
        that help us host, secure, and deliver Cally. We may also disclose
        information when required by law, to protect rights and safety, or as
        part of a business reorganisation.
      </p>
      <p>We do not sell your personal information.</p>
    </section>

    <section>
      <h2>5. Public information</h2>
      <p>
        Information you place on a public Cally profile or booking page—such as
        your name, username, image, description, event types, and available
        times—can be viewed by anyone with access to that page. Avoid publishing
        information you do not want others to see.
      </p>
    </section>

    <section>
      <h2>6. Storage, security, and retention</h2>
      <p>
        We use reasonable technical and organisational safeguards to protect
        information, but no online service can guarantee complete security. We
        retain information while your account is active and as needed to provide
        Cally, comply with legal obligations, resolve disputes, and protect the
        service. Retention periods vary by the type of information and why it is
        held.
      </p>
    </section>

    <section>
      <h2>7. Your choices and rights</h2>
      <p>
        You can update profile information and disconnect integrations from your
        account settings. You can also delete your account from your profile
        settings. Depending on where you live, you may have rights to access,
        correct, delete, restrict, or receive a copy of your personal
        information, or to object to certain uses.
      </p>
    </section>

    <section>
      <h2>8. Children</h2>
      <p>
        Cally is not directed to children under 13, and we do not knowingly
        collect personal information from children under 13.
      </p>
    </section>

    <section>
      <h2>9. Changes to this policy</h2>
      <p>
        We may update this policy as Cally changes. We will post the revised
        version here and update the effective date. If a change is material, we
        will provide additional notice where appropriate.
      </p>
    </section>

    <section>
      <h2>10. Contact</h2>
      <p>
        For privacy questions or requests, sign in and use the
        <NuxtLink to="/app/feedback">feedback page</NuxtLink>. Please do not send
        passwords or other sensitive credentials.
      </p>
    </section>
  </UiLegalPage>
</template>
