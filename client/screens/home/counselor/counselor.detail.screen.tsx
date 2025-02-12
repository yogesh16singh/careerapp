import { View, Text, ScrollView, Image, TouchableOpacity } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import axios from "axios";
import { SERVER_URI } from "@/utils/uri";
import {
  useFonts,
  Raleway_600SemiBold,
  Raleway_700Bold,
} from "@expo-google-fonts/raleway";
import {
  Nunito_400Regular,
  Nunito_500Medium,
  Nunito_700Bold,
  Nunito_600SemiBold,
} from "@expo-google-fonts/nunito";
import { useStripe } from "@stripe/stripe-react-native";
import { FontAwesome, Ionicons } from "@expo/vector-icons";
import CourseLesson from "@/components/courses/course.lesson";
import ReviewCard from "@/components/cards/review.card";
import AsyncStorage from "@react-native-async-storage/async-storage";
import useUser from "@/hooks/auth/useUser";
import Loader from "@/components/loader/loader";
import React from "react";
import RazorpayCheckout from "react-native-razorpay";

export default function CounselorDetailScreen() {
  const { item } = useLocalSearchParams();
  const { initPaymentSheet, presentPaymentSheet } = useStripe();
  const counselor: any = JSON.parse(item as string);
  const Skills = ["Communication", "Time Management"];

  let [fontsLoaded, fontError] = useFonts({
    Raleway_600SemiBold,
    Raleway_700Bold,
    Nunito_400Regular,
    Nunito_500Medium,
    Nunito_700Bold,
    Nunito_600SemiBold,
  });

  if (!fontsLoaded && !fontError) {
    return null;
  }
  const handlePayment = async () => {
    try {
      const accessToken = await AsyncStorage.getItem("access_token");
      const refreshToken = await AsyncStorage.getItem("refresh_token");
      const amount = 100;

      const paymentIntentResponse = await axios.post(
        `${SERVER_URI}/payment`,
        { amount },
        {
          headers: {
            "access-token": accessToken,
            "refresh-token": refreshToken,
          },
        }
      );
      console.log("23");
      // console.log("paymentIntentResponse", paymentIntentResponse);
      const {
        client_secret: clientSecret,
        ephemeralKey,
        customer,
      } = paymentIntentResponse.data;

      const initSheetResponse = await initPaymentSheet({
        merchantDisplayName: "Academy Private Ltd.",
        // paymentIntentClientSecret: 'pi_3QrHikFTiYqfwYEh0Zrwk4aG_secret_xt5Jgncnpvo7YSOgn2WIYMN7t',
        paymentIntentClientSecret: clientSecret,
          customerId: customer,
        customerEphemeralKeySecret: ephemeralKey,
        allowsDelayedPaymentMethods: false,
      });
      console.log("initSheetResponse", initSheetResponse);
      if (initSheetResponse.error) {
        console.error(initSheetResponse.error);
        return;
      }
      console.log("23999");
      const paymentResponse = await presentPaymentSheet();
      console.log("paymentResponse", paymentResponse);
      if (paymentResponse.error) {
        console.error(paymentResponse.error);
      } else {
        console.log("pares", paymentResponse);
        // await createOrder(paymentResponse);
      }
    } catch (error) {
      console.error(error);
    }
  };

  // const handlePayment = async () => {
  //   try {
  //     const accessToken = await AsyncStorage.getItem("access_token");
  //     const refreshToken = await AsyncStorage.getItem("refresh_token");
  //     const amount = 100;

  //     const response = await axios.post(
  //       `${SERVER_URI}/create-order-rp`,
  //       { amount, currency: "INR" },
  //       {
  //         headers: {
  //           "access-token": accessToken,
  //           "refresh-token": refreshToken,
  //         },
  //       }
  //     );

  //     const orderData = response.data;
  //     console.log("Order Created:", orderData);

  //     if (!orderData || !orderData.id) {
  //       // Alert.alert("Error", "Failed to create order");
  //       console.error("Failed to create order");
  //       return;
  //     }

  //     // 2️⃣ Initialize Razorpay Checkout
  //     const options = {
  //       description: "Payment for Order",
  //       image: "https://your-logo-url.com/logo.png",
  //       currency: "INR",
  //       key: "rzp_test_your_key_id", // Use Test Key
  //       amount: orderData.amount,
  //       name: "Your Business Name",
  //       order_id: orderData.id, // Order ID from backend
  //       prefill: {
  //         email: "test@example.com",
  //         contact: "9999999999",
  //         name: "John Doe",
  //       },
  //       theme: { color: "#3399cc" },
  //     };

  //     // 3️⃣ Open Razorpay Payment Modal
  //     const paymentResponse = await RazorpayCheckout.open(options);
  //     console.log("Payment Response:", paymentResponse);

  //     if (paymentResponse.razorpay_payment_id) {
  //       // 4️⃣ Verify Payment on Backend
  //       const verifyResponse = await fetch(`${SERVER_URI}/verify-payment`, {
  //         method: "POST",
  //         headers: {
  //           "Content-Type": "application/json",
  //           "access-token": accessToken,
  //           "refresh-token": refreshToken,
  //         },
  //         body: JSON.stringify({
  //           order_id: orderData.id,
  //           payment_id: paymentResponse.razorpay_payment_id,
  //           signature: paymentResponse.razorpay_signature,
  //         }),
  //       });

  //       const verificationResult = await verifyResponse.json();
  //       if (verificationResult.success) {
  //         // Alert.alert("Success", "Payment Verified Successfully!");
  //         console.log("Payment Verified Successfully!");
  //       } else {
  //         // Alert.alert("Error", "Payment Verification Failed");
  //         console.error("Payment Verification Failed");
  //       }
  //     } else {
  //       // Alert.alert("Error", "Payment Failed");
  //       console.error("Payment Failed");
  //     }
  //   } catch (error) {
  //     console.error("Payment Error:", error);
  //     // Alert.alert("Payment Error", error.message);
  //     console.error("Payment Error:", error);
  //   }
  // };

  return (
    <>
      <LinearGradient colors={["#E5ECF9", "#F6F7F9"]} style={{ flex: 1 }}>
        <ScrollView>
          <View style={{ alignItems: "center", padding: 20 }}>
            {/* Profile Image */}
            <Image
              source={{ uri: counselor?.avatar?.url || "@/assets/avatar.png" }}
              style={{
                width: 100,
                height: 100,
                borderRadius: 50,
                borderWidth: 2,
                borderColor: "#fff",
              }}
            />

            {/* Name & Language */}
            <Text style={{ fontSize: 22, fontWeight: "bold", marginTop: 10 }}>
              {counselor?.name}
            </Text>
            {/* <Text style={{ fontSize: 16, color: "gray" }}>{counselor?.languages.join(", ")}</Text> */}

            {/* Follow Button */}
            {/* <TouchableOpacity style={{ backgroundColor: "#0D47A1", padding: 10, borderRadius: 5, marginTop: 10 }}>
            <Text style={{ color: "white", fontWeight: "bold" }}>Follow</Text>
          </TouchableOpacity> */}
          </View>

          {/* Statistics */}
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-around",
              paddingVertical: 10,
            }}
          >
            {[
              { label: "⭐ Rating", value: "5" },
              {
                label: "Experience (years)",
                value: counselor?.experience || "0",
              },
              // { label: "Followers", value: counselor?.followers || "0" },
              // { label: "Orders", value: "N/A" }
            ].map((item, index) => (
              <View key={index} style={{ alignItems: "center" }}>
                <Text style={{ fontSize: 20, fontWeight: "bold" }}>
                  {item.value}
                </Text>
                <Text style={{ fontSize: 14, color: "gray" }}>
                  {item.label}
                </Text>
              </View>
            ))}
          </View>

          {/* Expertise & Skills */}
          <View style={{ padding: 20 }}>
            <Text
              style={{ fontSize: 18, fontWeight: "bold", marginBottom: 10 }}
            >
              Expertise
            </Text>
            <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
              {/* {counselor?.expertise?.map((item, index) => (
              <View key={index} style={{ alignItems: "center", marginRight: 15 }}>
                <FontAwesome name="star" size={24} color="#FFC107" />
                <Text style={{ fontSize: 14 }}>{item}</Text>
              </View>
            ))} */}
              <View style={{ alignItems: "center", marginRight: 15 }}>
                {/* <FontAwesome name="star" size={24} color="#FFC107" /> */}
                <Text style={{ fontSize: 14 }}>{counselor?.expertise}</Text>
              </View>
            </View>

            <Text style={{ fontSize: 18, fontWeight: "bold", marginTop: 20 }}>
              Skills
            </Text>
            <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
              {Skills?.map((item, index) => (
                <View
                  key={index}
                  style={{ alignItems: "center", marginRight: 15 }}
                >
                  <FontAwesome name="check-circle" size={24} color="#007BFF" />
                  <Text style={{ fontSize: 14 }}>{item}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Connect Section */}
          <View
            style={{
              backgroundColor: "#E3F2FD",
              padding: 20,
              alignItems: "center",
              marginTop: 34,
            }}
          >
            <View style={{ width: "100%", alignContent: "center" }}>
              {/* <TouchableOpacity style={{ backgroundColor: "#007BFF", padding: 10, borderRadius: 5 }}>
              <Text style={{ color: "white" }}>₹{counselor?.callRate}/min</Text>
            </TouchableOpacity> */}
              <TouchableOpacity
                onPress={() => handlePayment()}
                style={{
                  backgroundColor: "#007BFF",
                  padding: 10,
                  margin: 20,
                  borderRadius: 5,
                }}
              >
                <Text style={{ color: "white", textAlign: "center" }}>
                  ₹100 for complete guidance
                </Text>
              </TouchableOpacity>
            </View>
            <Text style={{ fontStyle: "italic", marginBottom: 10 }}>
              Connect with {counselor?.name}
            </Text>
          </View>
        </ScrollView>
      </LinearGradient>
    </>
  );
}
