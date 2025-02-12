import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import axios from "axios";
import { SERVER_URI } from "@/utils/uri";

const questions = [
  {
    id: 1,
    question: "What interests you the most?",
    options: [
      "💻 Technology & Programming",
      "🎨 Art & Design",
      "📊 Business & Finance",
      "⚕️ Healthcare & Medicine",
      "🌍 Social Work & Teaching",
      "🎭 Media & Entertainment",
      "🛠️ Engineering & Construction",
      "🚀 Research & Science",
      "🚜 Agriculture & Environment",
    ],
  },
  {
    id: 2,
    question: "What are your key strengths?",
    options: [
      "🔢 Problem-Solving",
      "🎭 Creativity",
      "📢 Leadership",
      "🏗 Analytical Thinking",
      "📝 Writing & Communication",
      "🎨 Creativity & Innovation",
      "🔬 Scientific Research & Analysis",
      "🤝 Teamwork & Collaboration",
    ],
  },
  {
    id: 3,
    question: "Preferred work environment?",
    options: [
      "🏢 Corporate Office (Stable, Structured)",
      "💻 Freelancing & Remote Work (Flexibility, Independence)",
      "🌍 Field Work (Outdoor, Hands-on)",
      "🔬 Research Lab (Science & Innovation)",
      "🚀 Startups & Entrepreneurship (Risk, Creativity)",
      "🎭 Creative Studio (Art, Media, Writing)",
      "🤝 Social & Public Services (Helping Others, Teaching, NGOs)",
    ],
  },
  {
    id: 4,
    question: "How do you prefer to work?",
    options: [
      "🎯 I like structured and organized work",
      "💡 I prefer freedom and flexibility in my work",
      "🧩 I enjoy solving complex problems",
      "🎤 I like interacting with people & networking",
      "🎨 I love creating new things (art, content, code, etc.)",
      "🔬 I enjoy research & deep thinking",
    ],
  },
  {
    id: 5,
    question: "What matters most to you?",
    options: [
      "💰 High salary & financial growth",
      "🏆 Personal growth & learning",
      "🌍 Making a social impact",
      "🎭 Creative expression & innovation",
      "⚖️ Work-life balance",
      "🚀 Entrepreneurial opportunities",
    ],
  },
  {
    id: 6,
    question: "What is your educational background?",
    options: [
      "🎓 Science & Engineering (STEM)",
      "🎨 Arts & Humanities",
      "📊 Commerce & Business",
      "⚕️ Medical & Healthcare",
      "🤝 Social Science & Public Policy",
      "💻 Self-Taught / Online Learning",
    ],
  },
];

const CareerChat = () => {
  const [answers, setAnswers] = useState({});
  const [step, setStep] = useState(0);
  const [careerSuggestion, setCareerSuggestion] = useState(null);
  const [buttonSpinner, setButtonSpinner] = useState(false);

  const handleSelectOption = (questionId, option) => {
    setAnswers((prev) => ({ ...prev, [questionId]: option }));
  };

  const handleNext = () => {
    if (step < questions.length - 1) {
      setStep(step + 1);
    }
  };

  const handlePrevious = () => {
    if (step > 0) {
      setStep(step - 1);
    }
  };

  const submitAnswers = async () => {
    console.log("answers", answers);
    setButtonSpinner(true);
    try {
      const response = await axios.post(`${SERVER_URI}/career-suggestion-ai`, {
        answers,
      }); 
      console.log("response", response.data);
      setCareerSuggestion(response.data.data);
      setButtonSpinner(false);
    } catch (error) {
      setButtonSpinner(false);
      console.error("Error fetching career suggestion", error);
    }
  };

  return (
    <ScrollView style={{ flex: 1, padding: 20 }}>
      {!careerSuggestion ? (
        <View>
          <Text style={{ fontSize: 20, fontWeight: "bold", marginBottom: 20 }}>
            {questions[step].question}
          </Text>
          <View style ={{ minHeight: 460 }}>
          {questions[step].options.map((option, index) => (
            <TouchableOpacity
              key={index}
              style={{
                backgroundColor:
                  answers[questions[step].id] === option
                    ? "#0a1359"
                    : "#7481e3",
                padding: 10,
                marginVertical: 5,
                borderRadius: 8,
                borderColor: "#e8cc15",
                borderWidth: answers[questions[step].id] === option ? 2 : 0,
              }}
              onPress={() => handleSelectOption(questions[step].id, option)}
            >
              <Text style={{ color: "#fff", textAlign: "center" }}>
                {option}
              </Text>
            </TouchableOpacity>
          ))}
            </View>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              marginTop: 20,
            }}
          >
            {step > 0 && (
              <TouchableOpacity
                style={{
                  backgroundColor: "#1570e8",
                  padding: 10,
                  borderRadius: 4,
                  minWidth: 150,
                }}
                onPress={handlePrevious}
              >
                <Text style={{ color: "#fff", textAlign: "center" }}>
                  Previous
                </Text>
              </TouchableOpacity>
            )}
            <View style={{ flex: 1, alignItems: "flex-end" }}>
              {step < questions.length - 1 ? (
                <TouchableOpacity
                  style={{
                    backgroundColor: "#1570e8",
                    padding: 10,
                    borderRadius: 4,
                    minWidth: 150,
                  }}
                  onPress={handleNext}
                >
                  <Text style={{ color: "#fff", textAlign: "center" }}>
                    Next
                  </Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  style={{
                    backgroundColor: "#28a745",
                    padding: 10,
                    borderRadius: 4,
                    minWidth: 150,
                  }}
                  onPress={submitAnswers}
                >
                  {buttonSpinner ? (
                    <ActivityIndicator size="small" color={"white"} />
                  ) : (
                    <Text style={{ color: "#fff", textAlign: "center" }}>
                      Submit
                    </Text>
                  )}
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>
      ) : (
        <View>
          <Text style={{ fontSize: 22, fontWeight: "bold" }}>
            AI Suggested Career options:
          </Text>
          <Text style={{ fontSize: 18, color: "#007bff", marginTop: 10 }}>
            {careerSuggestion}
          </Text>
        </View>
      )}
    </ScrollView>
  );
};

export default CareerChat;
