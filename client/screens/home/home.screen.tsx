import { View, Text, StyleSheet, ScrollView } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Header from "@/components/header/header";
import SearchInput from "@/components/common/search.input";
import HomeBannerSlider from "@/components/home/home.banner.slider";
import AllCourses from "@/components/courses/all.courses";
import HomeTopTextBox from "@/components/home/home.toptext.box";
import DashboardGrid from "@/components/home/home.button.grid";
import FeaturedCounselors from "@/components/home/Featured.counselors";
import Testimonials from "@/components/home/testimonial";

export default function HomeScreen() {
  return (
    <LinearGradient
      colors={["#E5ECF9", "#F6F7F9"]}
      style={{ flex: 1, paddingTop: 50 }}
    >
      <Header />
      {/* <SearchInput homeScreen={true} /> */}
      <ScrollView showsVerticalScrollIndicator={false}>
        <HomeTopTextBox />
        <DashboardGrid />
        <FeaturedCounselors />
        <Testimonials />
        <HomeBannerSlider />
        <AllCourses />
      </ScrollView>
    </LinearGradient>
  );
}

export const styles = StyleSheet.create({});
