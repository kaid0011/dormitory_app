import React from "react";
import { View, TouchableOpacity, Switch, Image } from "react-native";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import FontText from "./FontText";
import { useNavigation } from "@react-navigation/native";
import { useTheme } from '@/components/ThemeContext';
import { styles } from "@/assets/styles/styles";

const Header: React.FC = () => {
  const { isDarkMode, toggleTheme } = useTheme();
  const navigation = useNavigation();

  return (
    <View style={[styles.header, isDarkMode ? styles.darkHeader : styles.lightHeader]}>
      <View style={styles.headerContent}>
        {/* Back Button */}
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <FontAwesome6 name="arrow-left" size={24} color={"#fff"} />
        </TouchableOpacity>
        <Image source={require("@/assets/images/icon.png")} style={styles.headerLogo} />
        <FontText style={[styles.h2, isDarkMode ? styles.darkHeaderText : styles.lightHeaderText]}>
          Dormitory App
        </FontText>
      </View>
      <View style={styles.themeToggleContainer}>
        <FontAwesome6
          name={isDarkMode ? "sun" : "moon"}
          size={24}
          color={isDarkMode ? "#fff" : "#000"}
          style={styles.themeIcon}
        />
        <Switch
          value={isDarkMode}
          onValueChange={toggleTheme}
          style={styles.toggle}
        />
      </View>
    </View>
  );
};

export default Header;
