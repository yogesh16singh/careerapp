import React from "react";
import { SERVER_URI } from "@/utils/uri";
import axios from "axios";
import { useEffect, useState } from "react";
import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import {
  useFonts,
  Raleway_700Bold,
  Raleway_600SemiBold,
} from "@expo-google-fonts/raleway";
import {
  Nunito_400Regular,
  Nunito_700Bold,
  Nunito_500Medium,
  Nunito_600SemiBold,
} from "@expo-google-fonts/nunito";
import Loader from "@/components/loader/loader";
import { LinearGradient } from "expo-linear-gradient";
import CourseCard from "@/components/cards/course.card";
import ChatToggleButtons from "@/components/chat/Chat.toggle.buttons";
import NoChatPlaceholder from "@/components/chat/nochat.placeholder";

export default function ChatScreen() {
    const [selected, setSelected] = useState<'ai' | 'regular'>('ai');
  const [courses, setCourses] = useState<CoursesType[]>([]);
  const [originalCourses, setOriginalCourses] = useState<CoursesType[]>([]);
  const [loading, setLoading] = useState(true);
  const [categories, setcategories] = useState([]);
  const [activeCategory, setactiveCategory] = useState("All");

  useEffect(() => {
    axios
      .get(`${SERVER_URI}/get-layout/Categories`)
      .then((res) => {
        setcategories(res.data?.layout?.categories);
        fetchCourses();
        setLoading(false);
      })
      .catch((error) => {
        console.log(error);
        setLoading(false);
      });
  }, []);

  const fetchCourses = () => {
    axios
      .get(`${SERVER_URI}/get-courses`)
      .then((res: any) => {
        setCourses(res.data.courses);
        setOriginalCourses(res.data.courses);
        setLoading(false);
      })
      .catch((error) => {
        setLoading(false);
        console.log(error);
      });
  };

  let [fontsLoaded, fontError] = useFonts({
    Raleway_700Bold,
    Nunito_400Regular,
    Nunito_700Bold,
    Nunito_500Medium,
    Nunito_600SemiBold,
    Raleway_600SemiBold,
  });

  if (!fontsLoaded && !fontError) {
    return null;
  }

  const handleCategories = (e: string) => {
    setactiveCategory(e);
    if (e === "All") {
      setCourses(originalCourses);
    } else {
      const filterCourses = originalCourses.filter(
        (i: CoursesType) => i.categories === e
      );
      setCourses(filterCourses);
    }
  };

  return (
    <>
      {loading ? (
        <Loader />
      ) : (
        <LinearGradient
          colors={["#E5ECF9", "#F6F7F9"]}
          style={{ flex: 1, paddingTop: 32}}
        >
          <View style={{ paddingTop: 10,alignItems:'center' }}>
            <ChatToggleButtons selected={selected} setSelected={setSelected} />
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <NoChatPlaceholder selected={selected} />
            </ScrollView>
          </View>
        </LinearGradient>
      )}
    </>
  );
}
