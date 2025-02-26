export interface Questionnaire {
  title: string;
  sections: Section[];
}

export interface Section {
  name: string;
  questions: Question[];
}

export interface Question {
  id: number;
  type: "text" | "radio" | "checkbox";
  question: string;
  options?: string[];
}

export const questionnaireData: Questionnaire[] = [
  {
    title: "Questionnaire for Researcher",
    sections: [
      {
        name: "null",
        questions: [
          { id: 1, type: "text", question: "ชื่อหัวหน้าโครงการ" },
          { id: 2, type: "text", question: "ชื่อโครงการ" },
          { id: 3, type: "text", question: "ข้อมูลสาขาและกลุ่มวิจัย" }
        ]
      },
      {
        name: "บทบาทงานวิจัยของท่าน กับการค้นหา originated cell ของโรคที่เกี่ยวข้องกับงานวิจัย",
        questions: [
          {
            id: 4,
            type: "radio",
            question: "งานวิจัยที่ผ่านมาสอนมาเป็น",
            options: ["การรักษาโรค", "รักษา consequence ของโรค", "รักษาอาการ"]
          },
          {
            id: 5,
            type: "checkbox",
            question: "ถ้าการวิจัยรักษาโรคท่านคิดว่าน่าจะนำไปสู่ผลลัพธ์สุดท้ายคือ",
            options: ["Remission (หาย)", "Control", "Prevention", "ไม่แน่ใจ"]
          },
          {
            id: 6,
            type: "radio",
            question: "ถ้างานวิจัยของท่านไปสู่การรักษาให้หายได้เรียกว่า remission (หาย) โดยธรรมชาติมี criteria for diagnosis หรือไม่",
            options: ["มี (ส่งข้อมูลไปที่ ดร.วิปัศย์กร คล้ายเกตุ)", "ไม่มี"]
          },
          {
            id: 7,
            type: "radio",
            question: "ถ้ามี criteria for diagnosis มีผลทำให้มี remission ให้หายได้อย่างธรรมชาติหรือไม่",
            options: ["มี (ส่งข้อมูลไปที่ ดร.วิปัศย์กร คล้ายเกตุ)", "ยังไม่มี"]
          },
          {
            id: 8,
            type: "radio",
            question: "คาดว่าประสิทธิภาพการรักษางานวิจัยจะนำไปสู่ความสมบูรณ์ ผลตามเกณฑ์การ remission ร้อยละ 80 ของผู้ที่เข้าขเกณฑ์การวินิจฉัยหรือไม่",
            options: ["ถึงร้อยละ 80", "ใกล้เคียงกับร้อยละ 80", "ไม่ถึงร้อยละ 80"]
          },
          {
            id: 9,
            type: "radio",
            question: "มีข้อมูลทางโมเลกุลของกลไกการเกิดโรคหรือไม่",
            options: ["มี", "ยังไม่มี", "ไม่มี (ไม่ทราบ)"]
          },
          {
            id: 10,
            type: "radio",
            question: "มีข้อมูลทางโมเลกุลของกลไกการรักษาหรือไม่",
            options: ["มี", "ยังไม่มี", "ไม่มี (ไม่ทราบ)"]
          }
        ]
      },
      {
        name: "การค้นหา originated cell จากกลไกการเกิดโรค",
        questions: [
          {
            id: 11,
            type: "checkbox",
            question: "ข้อมูลทางโมเลกุล ที่ท่านสนใจ อยู่ในกลไกของกลไกการเกิดโรค โปรดระบุ (เลือกได้มากกว่า 1)",
            options: [
              "Inflammation",
              "Proliferation",
              "Wounding (tissue or cell damage)",
              "Dysdifferentiation",
              "Degeneration",
              "Growth abnormalities",
              "Dysfunction",
              "Ecological and environmental factors"
            ]
          }
        ]
      }
    ]
  }
];
