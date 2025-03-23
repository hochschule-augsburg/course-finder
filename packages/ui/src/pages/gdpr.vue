<script lang="ts" setup>
import { useI18n } from 'vue-i18n'

const { locale } = useI18n()
</script>

<template>
  <div class="mx-6">
    <template v-if="locale === 'de'">
      <h1>
        Datenschutzerklärung der Fakultät Informatik der Technischen Hochschule
        Augsburg für Course Finder
      </h1>
      <p>
        Diese Datenschutzerklärung enthält Informationen zur Verarbeitung
        personenbezogener Daten im Zusammenhang mit Course Finder. Im Folgenden
        informieren wir Sie darüber, welche Daten erfasst werden, wie sie
        verarbeitet werden und welche Rechte Ihnen zustehen.
      </p>

      <h2>§1 Verantwortliche Stelle und Datenschutzbeauftragter</h2>
      <p>
        Verantwortlich für die Datenverarbeitung ist die Technische Hochschule
        Augsburg, An der Hochschule 1, 86161 Augsburg. Den
        Datenschutzbeauftragten erreichen Sie unter:
        <a href="mailto:mail@kinast.eu">mail@kinast.eu</a>.
      </p>

      <h2>§2 Was sind personenbezogene Daten?</h2>
      <p>
        Personenbezogene Daten sind Informationen, die sich auf eine
        identifizierte oder identifizierbare natürliche Person beziehen. Dazu
        gehören unter anderem Name, Alter, Anschrift, Telefonnummer,
        Geburtsdatum, E-Mail-Adresse, IP-Adresse oder das Nutzerverhalten.
        Daten, die anonymisiert wurden und keinen Personenbezug mehr haben,
        gelten nicht als personenbezogene Daten.
      </p>
      <p>
        Die Verarbeitung personenbezogener Daten (z. B. Erhebung, Nutzung,
        Speicherung oder Übermittlung) erfordert eine gesetzliche Grundlage oder
        Ihre Einwilligung. Sobald der Zweck der Verarbeitung entfällt und keine
        gesetzlichen Aufbewahrungspflichten mehr bestehen, werden die Daten
        gelöscht.
      </p>

      <h2>§3 Einzelne Verarbeitungsvorgänge</h2>

      <h3>1. Datenverarbeitung im Rahmen der Hochschul-App</h3>

      <h4>a. Art und Umfang der Datenverarbeitung</h4>
      <p>
        Bei der Nutzung von CourseFinder werden IP-Adressen gespeichert. Für
        Studierende werden Anmeldedaten wie Name, Matrikelnummer, Fakultät,
        Studiengang und Semester zusammen mit den gewählten Kursen erfasst und
        zweckgebunden verarbeitet.
      </p>

      <h4>b. Rechtsgrundlage</h4>
      <p>
        Die Verarbeitung erfolgt auf Grundlage Ihrer Einwilligung gemäß Art. 6
        Abs. 1 S. 1 lit. a DSGVO, die vor dem ersten Login erteilt wird.
      </p>

      <h4>c. Speicherdauer</h4>
      <p>
        Ihre Daten werden gespeichert, solange sie für den Zweck der
        Wahlpflichtfachanmeldung erforderlich sind oder gesetzliche Vorgaben
        dies verlangen. Anschließend erfolgt die automatische Löschung nach 2
        Jahren.
      </p>

      <h2>§4 Empfänger und externe Dienstleister</h2>
      <p>
        Empfänger der personenbezogenen Daten sind ausschließlich die
        zuständigen Personen für die Wahlpflichtfachanmeldung der Fakultät
        Informatik der Technischen Hochschule Augsburg. Eine Weitergabe an
        Dritte oder eine Übermittlung in ein Drittland erfolgt nicht.
      </p>

      <h2>§5 Ihre Rechte</h2>
      <p>
        Sie haben folgende Rechte in Bezug auf Ihre personenbezogenen Daten:
      </p>
      <ul>
        <li>Recht auf Auskunft (Art. 15 DSGVO)</li>
        <li>Recht auf Berichtigung (Art. 16 DSGVO)</li>
        <li>Recht auf Löschung (Art. 17 DSGVO)</li>
        <li>Recht auf Datenübertragbarkeit (Art. 20 DSGVO)</li>
        <li>Recht auf Einschränkung der Verarbeitung (Art. 18 DSGVO)</li>
        <li>Recht auf Widerspruch gegen die Verarbeitung (Art. 21 DSGVO)</li>
      </ul>
      <p>
        Zudem können Sie sich bei der zuständigen Datenschutzbehörde über eine
        Ihrer Meinung nach unzulässige Datenverarbeitung beschweren:
        <a href="https://www.datenschutz-bayern.de/"
          >Bayerischer Landesbeauftragter für den Datenschutz</a
        >.
      </p>
      <p>Eine automatisierte Entscheidungsfindung findet nicht statt.</p>
      <p><strong>Augsburg, 02. März 2025</strong></p>
    </template>

    <template v-else>
      <h1>
        Privacy Policy of the Faculty of Computer Science at Augsburg University
        of Applied Sciences for Course Finder
      </h1>
      <p>
        This privacy policy provides information about the processing of
        personal data in connection with Course Finder. Below, we explain what
        data is collected, how it is processed, and what rights you have.
      </p>

      <h2>§1 Responsible Authority and Data Protection Officer</h2>
      <p>
        The responsible authority for this data processing is Augsburg
        University of Applied Sciences, An der Hochschule 1, 86161 Augsburg. The
        Data Protection Officer can be contacted at:
        <a href="mailto:mail@kinast.eu">mail@kinast.eu</a>.
      </p>

      <h2>§2 What is Personal Data?</h2>
      <p>
        Personal data includes any information related to an identified or
        identifiable natural person, such as name, age, address, phone number,
        birth date, email address, IP address, or user behavior. Data that has
        been anonymized and cannot be linked to a person is not considered
        personal data.
      </p>
      <p>
        The processing of personal data (e.g., collection, usage, storage, or
        transmission) requires a legal basis or your consent. Processed data is
        deleted once its purpose has been fulfilled and no legal retention
        obligations exist.
      </p>

      <h2>§3 Individual Processing Operations</h2>

      <h3>1. Data Processing in the University App</h3>

      <h4>a. Type and Scope of Data Processing</h4>
      <p>
        When using CourseFinder, IP addresses are stored. For students,
        registration data such as name, matriculation number, faculty, course of
        study, and semester, along with selected courses, is collected and
        processed for its intended purpose.
      </p>

      <h4>b. Legal Basis</h4>
      <p>
        The legal basis for this processing is your consent, provided before
        your first login, in accordance with Art. 6(1)(a) GDPR.
      </p>

      <h4>c. Storage Duration</h4>
      <p>
        Your data is stored as long as necessary for elective course
        registration or as required by legal regulations. It is automatically
        deleted after 2 years.
      </p>

      <h2>§4 Recipients and External Service Providers</h2>
      <p>
        The only recipients of this data are the responsible staff at the
        Faculty of Computer Science at Augsburg University of Applied Sciences.
        No data is shared with third parties or transferred to other countries.
      </p>

      <h2>§5 Your Rights</h2>
      <p>You have the following rights regarding your personal data:</p>
      <ul>
        <li>Right to access (Art. 15 GDPR)</li>
        <li>Right to rectification (Art. 16 GDPR)</li>
        <li>Right to erasure (Art. 17 GDPR)</li>
        <li>Right to data portability (Art. 20 GDPR)</li>
        <li>Right to restriction of processing (Art. 18 GDPR)</li>
        <li>Right to object to processing (Art. 21 GDPR)</li>
      </ul>
      <p>
        You may also file a complaint with the relevant data protection
        authority:
        <a href="https://www.datenschutz-bayern.de/"
          >Bavarian State Commissioner for Data Protection</a
        >.
      </p>
      <p>Automated decision-making does not take place.</p>
      <p><strong>Augsburg, March 2, 2025</strong></p>
    </template>
  </div>
</template>

<style lang="scss" scoped>
ul,
ol {
  padding: revert;
}
</style>
