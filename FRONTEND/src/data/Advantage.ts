/** @format */
// محتوى قسم "THE ADVANTAGE": العناوين هنا، والأرقام من لوحة التحكم.
// value: الرقم الذي يعدّ من 0 إليه. suffix: ما يُكتب بعده (+ أو %).

export interface Stat {
  value: number;
  suffix: string;
  label: string;
}

export const ADVANTAGE = {
  label: "The advantage",
  // السطران الكبيران
  heading: ["Experience", "guides the work"],
  side: "Execution",
};

// القائمة نفسها تأتي من الخادم (لوحة التحكم): useSiteData().stats
