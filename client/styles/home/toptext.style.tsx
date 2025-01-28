import { StyleSheet } from "react-native";
import { responsiveWidth } from "react-native-responsive-dimensions";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";

export const styles = StyleSheet.create({
    linearcontainer:{
        padding: 4,
        borderRadius: 4,
        shadowColor: '#000',
        margin: 6,
        marginTop: 16
    },
    container: {
      padding: 8,
      backgroundColor: '#ffffff',
      borderRadius: 4,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.2,
      shadowRadius: 4,
      elevation: 4,
      margin: 16,
    },
    heading: {
      fontSize: hp("3.7%"),
      textAlign: 'center',
      fontWeight: 'bold',
      color: '#333333',
      marginBottom: 8,
    },
    description: {
        fontSize: hp("2%"),
        textAlign: 'center',
      color: '#666666',
      lineHeight: 24,
    },
  });
