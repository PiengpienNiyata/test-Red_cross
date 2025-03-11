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
          { id: 1001, type: "text", question: "ชื่อหัวหน้าโครงการ" },
          { id: 1002, type: "text", question: "ชื่อโครงการ" },
          { id: 1003, type: "text", question: "ข้อมูลสาขาและกลุ่มวิจัย" },
          { id: 1004, type: "text", question: "เบอร์โทรศัพท์" },
          { id: 1005, type: "text", question: "ที่อยู่อีเมล" }
        ]
      },
      {
        name: "บทบาทงานวิจัยของท่าน กับการค้นหา originated cell ของโรคที่เกี่ยวข้องกับงานวิจัย",
        questions: [
          {
            id: 1006,
            type: "radio",
            question: "งานวิจัยที่ผ่านมาสอนมาเป็น",
            options: ["การรักษาโรค", "รักษา consequence ของโรค", "รักษาอาการ"]
          },
          {
            id: 1007,
            type: "checkbox",
            question: "ถ้าการวิจัยรักษาโรคท่านคิดว่าน่าจะนำไปสู่ผลลัพธ์สุดท้ายคือ",
            options: ["Remission (หาย)", "Control", "Prevention", "ไม่แน่ใจ"]
          },
          {
            id: 1008,
            type: "radio",
            question: "ถ้างานวิจัยของท่านไปสู่การรักษาให้หายได้เรียกว่า remission (หาย) โดยธรรมชาติมี criteria for diagnosis หรือไม่",
            options: ["มี (ส่งข้อมูลไปที่ ดร.วิปัศย์กร คล้ายเกตุ)", "ไม่มี"]
          },
          {
            id: 1009,
            type: "radio",
            question: "ถ้ามี criteria for diagnosis มีผลทำให้มี remission ให้หายได้อย่างธรรมชาติหรือไม่",
            options: ["มี (ส่งข้อมูลไปที่ ดร.วิปัศย์กร คล้ายเกตุ)", "ยังไม่มี"]
          },
          {
            id: 1010,
            type: "radio",
            question: "คาดว่าประสิทธิภาพการรักษางานวิจัยจะนำไปสู่ความสมบูรณ์ ผลตามเกณฑ์การ remission ร้อยละ 80 ของผู้ที่เข้าขเกณฑ์การวินิจฉัยหรือไม่",
            options: ["ถึงร้อยละ 80", "ใกล้เคียงกับร้อยละ 80", "ไม่ถึงร้อยละ 80"]
          },
          {
            id: 1011,
            type: "radio",
            question: "มีข้อมูลทางโมเลกุลของกลไกการเกิดโรคหรือไม่",
            options: ["มี", "ยังไม่มี", "ไม่มี (ไม่ทราบ)"]
          },
          {
            id: 1012,
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
            id: 1013,
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
          },
          {
            id: 1014,
            type: "radio",
            question: "โปรดระบุเป้าหมายสุดท้ายของ route ที่ท่านสามารถวิเคราะห์ บน road map ดังนี้",
            options: [
              "Remission and protection (ป้องกันได้ทุก predisposing factor)",
              "Control เป็นปกติ แต่ยังมีเหตุ (root cause) อยู่จึงยังหยุดรักษาไม่ได้",
              "Prevention โรคหายเองแต่งานวิจัยช่วยลดโอกาสการเกิด กลับมาเป็นใหม่ (จากบาง predisposing factor)",
            ]
          }
        ]
      }
    ]
  }
]