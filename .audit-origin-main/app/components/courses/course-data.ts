export type Course = {
  id: string;
  title: string;
  category: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced" | "Career track";
  thumbnail: string;
  instructor: {
    name: string;
    role: string;
    initials: string;
  };
  rating: number;
  reviews: number;
  students: string;
  duration: string;
  lessons: number;
  progress: number;
  description: string;
  longDescription: string;
  previewLabel: string;
  certificate: {
    title: string;
    description: string;
  };
  resources: {
    title: string;
    type: string;
    size: string;
  }[];
  curriculum: CourseModule[];
};

export type CourseModule = {
  id: string;
  title: string;
  duration: string;
  lessons: Lesson[];
};

export type Lesson = {
  id: string;
  title: string;
  duration: string;
  type: "Video" | "Reading" | "Quiz" | "Project";
  completed: boolean;
};

export type LessonWithModule = Lesson & {
  moduleId: string;
  moduleTitle: string;
  lessonNumber: number;
};

export function getCourseLessons(course: Course): LessonWithModule[] {
  return course.curriculum.flatMap((module) =>
    module.lessons.map((lesson, index) => ({
      ...lesson,
      moduleId: module.id,
      moduleTitle: module.title,
      lessonNumber: index + 1,
    })),
  );
}

export function getLessonById(course: Course, lessonId: string) {
  return getCourseLessons(course).find((lesson) => lesson.id === lessonId);
}

export function getLessonNavigation(course: Course, lessonId: string) {
  const lessons = getCourseLessons(course);
  const currentIndex = lessons.findIndex((lesson) => lesson.id === lessonId);

  return {
    previousLesson: currentIndex > 0 ? lessons[currentIndex - 1] : undefined,
    nextLesson:
      currentIndex >= 0 && currentIndex < lessons.length - 1
        ? lessons[currentIndex + 1]
        : undefined,
  };
}

export function getFirstLesson(course: Course) {
  return getCourseLessons(course)[0];
}
