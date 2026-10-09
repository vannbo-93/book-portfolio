/** @format */
// محتوى قسم "THE ADVANTAGE".
// الأرقام هنا مؤقتة: استبدلها بأرقام صاحب الموقع الحقيقية.
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

export const STATS: Stat[] = [
  { value: 10, suffix: "+", label: "Client collaborations" },
  { value: 5, suffix: "+", label: "Years in practice" },
  { value: 25, suffix: "+", label: "Delivered works" },
  { value: 100, suffix: "%", label: "End-to-end delivery" },
];
