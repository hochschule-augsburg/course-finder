import { template } from 'lodash-es'

export const openingMail: (data: {
  contactEmail: string
  dateDe: string
  dateEn: string
  url: string
}) => string = template(`
Sehr geehrte Studierende,<br><br>

zu Beginn des Semesters findet wie immer die Anmeldung für die Wahlpflichtfächer statt.<br><br>

Auf der Website <a href="<%= url %>"><%= url %></a> 
können Sie jetzt Ihr Semester planen und sich für die Fächer anmelden, die Sie im kommenden Semester belegen möchten.<br>

Eine Anleitung zur Bedienung finden Sie <a href="https://hochschule-augsburg.github.io/course-finder/student.html">hier</a>.<br><br>

Die Zuteilung der Fächer erfolgt über ein priorisiertes Verfahren. Bitte überlegen Sie sich gut, wie viele Fächer Sie erfolgreich studieren können, 
und melden Sie sich entsprechend an. Planen Sie auch Ersatzfächer ein, falls ein Fach bereits voll ist oder aufgrund zu geringer Teilnehmerzahl ausfällt. 
Geben Sie jedoch nur so viele CP an, wie Sie im kommenden Semester tatsächlich mit Wahlpflichtfächern erreichen möchten (und können). 
Weitere Details finden Sie auf der Anmeldeseite.<br><br>

<b>Die Anmeldung läuft bis <%= dateDe %>.</b><br><br>

Bitte warten Sie nicht bis zum letzten Tag – Sie können Ihre Wahl bis zum Anmeldeschluss jederzeit korrigieren.<br><br>

Jedes Semester gibt es auch interessante Kurse, die <b>nicht</b> über die CourseFinder-Plattform vergeben werden.
Diese werden häufig per E-Mail angekündigt und sind in CourseFinder mit einem "E" für externe Anmeldung gekennzeichnet.<br><br>

Studierende des 1. und 2. Semesters können sich noch nicht für Wahlpflichtfächer eintragen, da sie sich in der Orientierungsphase befinden. 
Sie können jedoch bereits einen Blick auf das Angebot werfen und so für die nächsten Semester planen.<br><br>

Bei Problemen mit der Anmeldung senden Sie bitte eine E-Mail an 
<a href="mailto:<%= contactEmail %>"><%= contactEmail %></a>.<br>
<br>

--- <br><br>

Dear Students,<br><br>

At the beginning of the semester, as always, the registration for elective courses takes place.<br><br>

On the website <a href="<%= url %>"><%= url %></a> 
you can now plan your semester and register for the courses you would like to take in the upcoming semester.<br>

A guide on how to use the system can be found <a href="https://hochschule-augsburg.github.io/course-finder/student.html">here</a>.<br><br>

The allocation of courses is done through a prioritized procedure. Please carefully consider how many courses you can successfully complete 
and register accordingly. Also, plan for alternative courses in case a course is already full or is canceled due to low enrollment. 
However, only specify as many credit points as you actually intend (and are able) to achieve with elective courses in the upcoming semester. 
Further details can be found on the registration page.<br><br>

<b>Registration is open until <%= dateEn %>.</b><br><br>

Please do not wait until the last day – you can adjust your selection at any time until the registration deadline.<br><br>

Each semester, there are also interesting courses that are not allocated through the CourseFinder platform.
These are often announced via email and are marked with an "E" in CourseFinder for external registration.<br><br>

Students in the 1st and 2nd semesters cannot yet register for elective courses as they are still in the orientation phase. 
However, they can already take a look at the available courses and start planning for future semesters.<br><br>

If you encounter any issues with the registration, please send an email to 
<a href="mailto:<%= contactEmail %>"><%= contactEmail %></a>.<br>
`)
