# Assignment Algorithm

1. Normalize all points of students to a specific number.
   This ensures that no one can choose too many points and
   enables more error-tolerant code.

   The number could be changed to 3 to support first, second and third choice.

   By default 1000 is assumed.

2. Assignment
   2.1 Sort all choices by the number of points.
   2.2 Shuffle the highest choices
   2.3 Assign the highest choices to the students
   Add the creditPoints to this student
   2.4 Remove this student's remaining choices that overlap with a gained course.
   Redistribute their points equally among the remaining choices. Add the
   remainder to the highest-scored remaining choice.
   2.5 Increase the number of students for course
   2.6 If course is full now remove all choices of this course for all students
   2.7 Repeat until all students achieved their creditPoints or don't have any choices left

3. Until there is no course that has too few participants remove one cancelled course and jump to 2.

4. Return the result

Weekly appointments repeat by weekday and local time in Europe/Berlin.
Irregular appointments use their exact dates and times. Block appointments
cover all days from the start date through the end date, inclusive. All
appointment types are compared with each other. Back-to-back appointments do
not overlap; courses without appointments do not block other choices. When a
course is cancelled for not meeting its minimum, the assignment is restarted
from the original choices, excluding cancelled courses, so alternatives are
considered again.
