"use client";

import { useState } from "react";
import { CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

const sections = [
  {
    title: "1. Chief Complaint",
    questions: [
      {
        id: "q1",
        label:
          "Q1. What is your primary concern today? (Select all that apply)",
        type: "checkbox",
        options: [
          "Fever",
          "Cough / Cold",
          "Headache",
          "Body aches / Fatigue",
          "Stomach pain / Indigestion",
          "Breathing difficulty",
          "High BP / Sugar check",
          "Swelling / Pain in limbs",
          "Dizziness / Fainting",
          "Sleep issues",
          "Mental stress / Anxiety",
          "Other",
        ],
      },
    ],
  },
  {
    title: "2. Symptom Onset & Duration",
    questions: [
      {
        id: "q2",
        label: "Q2. When did your symptoms start?",
        type: "radio",
        options: [
          "Just today",
          "2–3 days ago",
          "About a week ago",
          "More than 1 week ago",
          "Can’t remember",
        ],
      },
      {
        id: "q3",
        label: "Q3. Are symptoms:",
        type: "radio",
        options: ["Constant", "On and off", "Worsening over time", "Improving"],
      },
    ],
  },
  {
    title: "3. Symptom Severity",
    questions: [
      {
        id: "q4",
        label: "Q4. How severe is the problem right now?",
        type: "radio",
        options: ["Mild (1–3/10)", "Moderate (4–6/10)", "Severe (7–10/10)"],
      },
      {
        id: "q5",
        label: "Q5. Are your daily activities affected?",
        type: "radio",
        options: ["No", "Yes, a little", "Yes, significantly"],
      },
    ],
  },
  {
    title: "4. Associated Symptoms",
    questions: [
      {
        id: "q6",
        label: "Q6. Are you experiencing any of these?",
        type: "checkbox",
        options: [
          "Loss of appetite",
          "Nausea / Vomiting",
          "Diarrhea / Constipation",
          "Chest discomfort",
          "Breathlessness",
          "Palpitations",
          "Sweating",
          "Chills",
          "Weight loss",
          "Sleep disturbance",
          "Anxiety / Mood swings",
          "Memory issues",
          "None",
        ],
      },
    ],
  },
  {
    title: "5. Past Medical History",
    questions: [
      {
        id: "q7",
        label: "Q7. Have you ever been diagnosed with:",
        type: "checkbox",
        options: [
          "High blood pressure",
          "Diabetes",
          "Asthma / COPD",
          "Thyroid disorder",
          "Heart disease",
          "Stroke",
          "Kidney disease",
          "Liver disease",
          "Cancer",
          "Mental illness",
          "None",
        ],
      },
    ],
  },
  {
    title: "6. Medications",
    questions: [
      {
        id: "q8",
        label: "Q8. Are you on any regular medications?",
        type: "radio",
        options: ["Yes", "No"],
      },
      {
        id: "q9",
        label: "Q9. Any recent antibiotics, painkillers, or supplements?",
        type: "radio",
        options: ["Yes", "No"],
      },
    ],
  },
  {
    title: "7. Allergies",
    questions: [
      {
        id: "q10",
        label: "Q10. Are you allergic to any of the following?",
        type: "checkbox",
        options: [
          "Medicines",
          "Foods",
          "Dust / Pollen",
          "Insect bites",
          "Other",
          "No known allergies",
        ],
      },
    ],
  },
  {
    title: "8. Family History",
    questions: [
      {
        id: "q11",
        label: "Q11. Any family history of:",
        type: "checkbox",
        options: [
          "Diabetes",
          "High BP",
          "Heart disease",
          "Cancer",
          "Stroke",
          "Mental illness",
          "Thyroid disease",
          "None",
        ],
      },
    ],
  },
  {
    title: "9. Lifestyle & Habits",
    questions: [
      {
        id: "q12",
        label: "Q12. Do you:",
        type: "checkbox",
        options: [
          "Smoke",
          "Drink alcohol",
          "Use tobacco / pan / gutka",
          "Eat outside often",
          "Exercise regularly",
          "Sleep well?",
          "Feel stressed frequently",
        ],
      },
    ],
  },
  {
    title: "10. For Women",
    questions: [
      {
        id: "q13",
        label: "Q13. Are you:",
        type: "radio",
        options: [
          "Pregnant",
          "Breastfeeding",
          "Menstruating regularly?",
          "Menopausal",
          "None / Not applicable",
        ],
      },
    ],
  },
  {
    title: "11. Health Monitoring",
    questions: [
      {
        id: "q14",
        label: "Q14. Have you checked your:",
        type: "text_group",
        options: [
          "Blood Pressure (mmHg)",
          "Blood Sugar (mg/dL)",
          "Weight (kg)",
          "Pulse / Heart Rate (bpm)",
          "Oxygen saturation (SpO₂) (%)",
        ],
      },
    ],
  },
];
 
export default function GeneralMedicineForm() {
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const router = useRouter();

  const handleChange = (id: string, value: any) => {
    setAnswers((prev) => ({ ...prev, [id]: value }));
  };

  const handleCheckbox = (id: string, option: string) => {
    const current = answers[id] || [];
    handleChange(
      id,
      current.includes(option)
        ? current.filter((v: string) => v !== option)
        : [...current, option]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const result: { question: string; answer: any }[] = [];

    sections.forEach((section) => {
      section.questions.forEach((q) => {
        if (q.type === "text_group") {
          q.options?.forEach((opt) => {
            const val = answers[`${q.id}-${opt}`] || "";
            result.push({ question: `${q.label} - ${opt}`, answer: val });
          });
        } else {
          result.push({ question: q.label, answer: answers[q.id] || "" });
        }
      });
    });

    if (answers.q8 === "Yes") {
      result.push({
        question: "List regular medications",
        answer: answers.q8_text || "",
      });
    }
    if (answers.q9 === "Yes") {
      result.push({
        question: "Mention antibiotics/painkillers/supplements",
        answer: answers.q9_text || "",
      });
    }

    console.log(result);
    router.push("/dashboard/nurse/check-in");
  };

  return (
    <div className="flex justify-center px-2">
      <CardContent className="max-w-3xl w-full space-y-6 py-6">
        <h1 className="text-2xl font-bold text-center">
          General Medicine: Patient Pre-Consultation Self-Assessment
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          {sections.map((section) => (
            <div key={section.title} className="space-y-4">
              <h2 className="text-lg font-semibold">{section.title}</h2>

              {section.questions.map((q) => (
                <div key={q.id} className="space-y-2">
                  <Label className="block font-medium">{q.label}</Label>

                  {q.type === "radio" && (
                    <RadioGroup
                      value={answers[q.id] || ""}
                      onValueChange={(val) => handleChange(q.id, val)}
                    >
                      {q.options?.map((opt) => (
                        <div key={opt} className="flex items-center space-x-2">
                          <RadioGroupItem
                            className="border-black"
                            value={opt}
                            id={`${q.id}-${opt}`}
                          />
                          <Label htmlFor={`${q.id}-${opt}`}>{opt}</Label>
                        </div>
                      ))}
                    </RadioGroup>
                  )}

                  {q.type === "checkbox" &&
                    q.options?.map((opt) => (
                      <div key={opt} className="flex items-center space-x-2">
                        <Checkbox
                          className="border-black"
                          id={`${q.id}-${opt}`}
                          checked={(answers[q.id] || []).includes(opt)}
                          onCheckedChange={() => handleCheckbox(q.id, opt)}
                        />
                        <Label htmlFor={`${q.id}-${opt}`}>{opt}</Label>
                      </div>
                    ))}

                  {q.id === "q8" && answers["q8"] === "Yes" && (
                    <div>
                      <Label>List them:</Label>
                      <Textarea
                        value={answers.q8_text || ""}
                        onChange={(e) =>
                          handleChange("q8_text", e.target.value)
                        }
                      />
                    </div>
                  )}

                  {q.id === "q9" && answers["q9"] === "Yes" && (
                    <div>
                      <Label>Mention them:</Label>
                      <Textarea
                        value={answers.q9_text || ""}
                        onChange={(e) =>
                          handleChange("q9_text", e.target.value)
                        }
                      />
                    </div>
                  )}

                  {q.type === "text_group" &&
                    q.options?.map((opt) => {
                      const [label, unit] = opt.split("(");
                      const cleanUnit = unit?.replace(")", "");
                      return (
                        <div
                          key={opt}
                          className="flex flex-col md:flex-row md:items-center gap-2"
                        >
                          <Label className="md:w-48">{label.trim()}:</Label>
                          <Input
                            type="text"
                            className="border-black w-full md:w-52"
                            value={answers[`${q.id}-${opt}`] || ""}
                            onChange={(e) =>
                              handleChange(`${q.id}-${opt}`, e.target.value)
                            }
                          />
                          <span className="text-sm text-gray-700">
                            {cleanUnit}
                          </span>
                        </div>
                      );
                    })}
                </div>
              ))}
            </div>
          ))}

          <div className="flex justify-end pt- pr-4 md:pr-20">
            <Button type="submit" className="w-full md:w-52">
              Submit
            </Button>
          </div>
        </form>
      </CardContent>
    </div>
  );
}