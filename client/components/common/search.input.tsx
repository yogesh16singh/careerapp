import {
  View,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  FlatList,
  Text,
  Image,
  ScrollView,
} from "react-native";
import { FontAwesome5 } from "@expo/vector-icons";
import { useFonts, Nunito_700Bold } from "@expo-google-fonts/nunito";
import { AntDesign, Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import axios from "axios";
import { SERVER_URI } from "@/utils/uri";
import { router } from "expo-router";
import CourseCard from "../cards/course.card";
import { widthPercentageToDP } from "react-native-responsive-screen";

const dummycounselors = [
  {
    _id: "1",
    name: "Laxman Singh",
    expertise: "Software Development",
    experience: "1 year experience",
    availability: "Monday-Friday, 9 AM - 5 PM",
    image: require("@/assets/avatar.png"),
  },
  {
    _id: "2",
    name: "Sarah Johnson",
    expertise: "Career Development",
    experience: "5 years experience",
    availability: "Tuesday-Saturday, 10 AM - 6 PM",
    image: require("@/assets/avatar.png"),
  },
  {
    _id: "3",
    name: "Michael Chen",
    expertise: "Life Coaching",
    experience: "3 years experience",
    availability: "Monday-Friday, 11 AM - 7 PM",
    image: require("@/assets/avatar.png"),
  },
  {
    _id: "4",
    name: "Sarah Johnson",
    expertise: "Career Development",
    experience: "5 years experience",
    availability: "Tuesday-Saturday, 10 AM - 6 PM",
    image: require("@/assets/avatar.png"),
  },
  {
    _id: "5",
    name: "Michael Chen",
    expertise: "Life Coaching",
    experience: "3 years experience",
    availability: "Monday-Friday, 11 AM - 7 PM",
    image: require("@/assets/avatar.png"),
  },
];
type CounselorsType = {
  _id: string;
  name: string;
  expertise: string;
  experience: string;
  availability: string;
  avatar: {
    public_id: string;
    url: string;
  };
};
export default function SearchInput({ homeScreen }: { homeScreen?: boolean }) {
  const [value, setValue] = useState("");
  const [counselors, setCounselors] = useState();
  const [filteredCounselors, setFilteredCounselors] = useState<
    CounselorsType[]
  >([]);

  useEffect(() => {
    axios
      .get(`${SERVER_URI}/get-counselors`)
      .then((res: any) => {
        console.log("res", res.data.counselors);
        setCounselors(res.data.counselors);
        if (!homeScreen) {
          setFilteredCounselors(res.data.counselors);
        }
      })
      .catch((error) => {
        console.log(error);
      });
  }, []);
  useEffect(() => {
    if (homeScreen && value === "") {
      setFilteredCounselors([]);
    } else if (value) {
      const filtered = counselors?.filter((counselor: CounselorsType) =>
        counselor.name.toLowerCase().includes(value.toLowerCase())
      );
      setFilteredCounselors(filtered);
    } else if (!homeScreen) {
      setFilteredCounselors(counselors);
    }
  }, [value, counselors]);

  let [fontsLoaded, fontError] = useFonts({
    Nunito_700Bold,
  });

  if (!fontsLoaded && !fontError) {
    return null;
  }

  const renderCourseItem = ({ item }: { item: CoursesType }) => (
    <TouchableOpacity
      style={{
        backgroundColor: "#fff",
        padding: 10,
        width: widthPercentageToDP("90%"),
        marginLeft: "1.5%",
        flexDirection: "row",
      }}
      onPress={() =>
        router.push({
          pathname: "/(routes)/course-details",
          params: { item: JSON.stringify(item) },
        })
      }
    >
      <Image
        source={{ uri: item?.thumbnail?.url }}
        style={{ width: 60, height: 60, borderRadius: 10 }}
      />
      <Text
        style={{
          fontSize: 14,
          paddingLeft: 10,
          width: widthPercentageToDP("75%"),
        }}
      >
        {item.name}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View>
      <View style={styles.filteringContainer}>
        <View style={styles.searchContainer}>
          <TextInput
            style={[styles.input, { fontFamily: "Nunito_700Bold" }]}
            placeholder="Search"
            value={value}
            onChangeText={setValue}
            placeholderTextColor={"#C67cc"}
          />
          <TouchableOpacity
            style={styles.searchIconContainer}
            onPress={() => router.push("/(tabs)/search")}
          >
            <AntDesign name="search1" size={20} color={"#fff"} />
          </TouchableOpacity>
        </View>
      </View>
      <View style={styles.container}>
        <View style={styles.filterContainer}>
          <TouchableOpacity style={styles.filterButton}>
            <Text>Availability ▼</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.filterButton}>
            <Text>Expertise ▼</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.filterButton}>
            <Text>Experience ▼</Text>
          </TouchableOpacity>
        </View>
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          showsVerticalScrollIndicator={true}
        >
          <View style={{ paddingHorizontal: 4 }}>
            <FlatList
              data={filteredCounselors}
              keyExtractor={(item: CounselorsType) => item._id}
              renderItem={({ item }: { item: CounselorsType }) => (
                <View style={styles.card}>
                  <View style={styles.cardContent}>
                    <View>
                      <Text style={styles.name}>{item.name}</Text>
                      <Text style={styles.expertise}>{item.expertise}</Text>
                      <View style={styles.infoRow}>
                        <FontAwesome5 name="briefcase" size={16} color="#555" />
                        <Text style={styles.infoText}>
                          {item.experience} Years
                        </Text>
                      </View>
                      <View style={styles.infoRow}>
                        <FontAwesome5 name="clock" size={16} color="#555" />
                        <Text style={styles.infoText}>{item.availability}</Text>
                      </View>
                    </View>
                    <Image
                      source={
                        item?.avatar?.url
                          ? { uri: item.avatar.url }
                          : require("@/assets/avatar.png")
                      }
                      style={styles.profileImage}
                    />
                  </View>
                  <TouchableOpacity
                    style={styles.contactButton}
                    onPress={() =>
                      router.push({
                        pathname: "/(routes)/counsellor-detail",
                        params: { item: JSON.stringify(item) },
                      })
                    }
                  >
                    <Text style={styles.contactButtonText}> View Profile</Text>
                  </TouchableOpacity>
                </View>
              )}
            />
          </View>
        </ScrollView>
      </View>
      {!homeScreen && (
        <>
          {filteredCounselors?.length === 0 && (
            <Text
              style={{
                textAlign: "center",
                paddingTop: 50,
                fontSize: 20,
                fontWeight: "600",
              }}
            >
              No data avaialble to show!
            </Text>
          )}
        </>
      )}
    </View>
  );
}

export const styles = StyleSheet.create({
  filteringContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginHorizontal: 16,
  },

  searchContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    borderRadius: 5,
    paddingHorizontal: 10,
    marginRight: 10,
  },

  searchIconContainer: {
    width: 36,
    height: 36,
    backgroundColor: "#2467EC",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 4,
  },

  input: {
    flex: 1,
    fontSize: 14,
    color: "black",
    paddingVertical: 10,
    width: 271,
    height: 48,
  },
  container: {
    padding: 15,
    marginBottom: 180,
  },
  filterContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 15,
  },
  filterButton: {
    padding: 8,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
  },
  card: {
    backgroundColor: "white",
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  name: {
    fontSize: 16,
    fontWeight: "bold",
  },
  expertise: {
    color: "gray",
    marginBottom: 5,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 3,
  },
  infoText: {
    marginLeft: 5,
    color: "#555",
  },
  profileImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  contactButton: {
    backgroundColor: "#007BFF",
    padding: 10,
    borderRadius: 8,
    marginTop: 10,
  },
  contactButtonText: {
    color: "white",
    textAlign: "center",
  },
});
