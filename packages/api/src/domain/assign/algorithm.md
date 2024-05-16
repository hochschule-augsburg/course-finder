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
   2.4 Increase the number of students for course
   2.5 If course is full now remove all choices of this course for all students
   2.6 Repeat until all students achieved their creditPoints or don't have any choices left

3. Until there is no course that has too few participants remove one cancelled course and jump to 2.

4. Return the result
