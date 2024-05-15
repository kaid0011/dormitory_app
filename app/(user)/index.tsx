import React from "react";
import { useState, useEffect } from "react";
// import { supabase } from "../../lib/supabase";
// import { Session } from "@supabase/supabase-js";
import { StyleSheet, View, Text, Alert, Pressable, Button } from "react-native";
import { Link } from "expo-router";

export default function HomeScreen() {

  // Get today's date and next 4 dates
  const today = new Date();

  const nextDates = [];
  for (let i = 0; i <= 4; i++) {
    const nextDate = new Date();
    nextDate.setDate(today.getDate() + i);
    nextDates.push(formatDate(nextDate));
  }

  function formatDate(date: Date) {
    const options = { month: "long", day: "numeric", weekday: "long" };
    const month = date
      .toLocaleDateString("en-US", { month: "long" })
      .slice(0, 3);
    const day = date.toLocaleDateString("en-US", { day: "numeric" });
    const dayOfWeek = date
      .toLocaleDateString("en-US", { weekday: "long" })
      .slice(0, 3);
    return `${month}\n${day}\n${dayOfWeek}`;
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.greeting}>Welcome back!</Text>
        <Text style={styles.date}>Today's Date:</Text>
      </View>
      <View style={styles.squareContainer}>
        {nextDates.map((date, index) => (
          <View
            key={index}
            style={[styles.square, index !== 0 && styles.borderOnly]}
          >
            <Text
              style={[styles.squareText, index !== 0 && styles.borderOnlyText]}
            >
              {date}
            </Text>
          </View>
        ))}
      </View>
      <View style={styles.directory}>
        <Link style={styles.button} href="./qrsending" asChild>
          <Pressable>
            <Text style={styles.buttonText}>Sending Laundry</Text>
          </Pressable>
        </Link>
        <Link
          style={styles.button} href="./returning" asChild>
          <Pressable>
            <Text style={styles.buttonText}>Returning Laundry</Text>
          </Pressable>
        </Link>
        <Link style={styles.button} href="./qrbalance" asChild>
          <Pressable>
            <Text style={styles.buttonText}>Check Balance</Text>
          </Pressable>
        </Link>
        <Link style={styles.button} href="./history" asChild>
          <Pressable>
            <Text style={styles.buttonText}>History</Text>
          </Pressable>
        </Link>
      </View>
        {/* <Button title="Sign Out" onPress={() => supabase.auth.signOut()} /> */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    paddingTop: 50,
  },
  directory: {
    alignItems: "center",
    width: "100%",
  },
  header: {
    marginBottom: 20,
    alignItems: "flex-start",
    alignSelf: "stretch",
    paddingLeft: "10%",
  },
  greeting: {
    fontSize: 24,
    fontWeight: "bold",
    paddingBottom: 20,
  },
  date: {
    fontSize: 16,
    fontWeight: "bold",
  },
  squareContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "80%",
    marginBottom: 20,
  },
  square: {
    width: "17%",
    height: 70,
    backgroundColor: "#007bff",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 20,
  },
  squareText: {
    color: "white",
    textAlign: "center",
    fontSize: 14,
  },
  borderOnly: {
    backgroundColor: "transparent", // Remove background color
    borderWidth: 1, // Add border width
    borderColor: "#007bff", // Border color same as background color
  },
  borderOnlyText: {
    color: "#007bff", // Text color same as border color
  },
  dayText: {
    fontSize: 20, // Increase font size for day
    fontWeight: "bold", // Make it bold
  },
  button: {
    width: "80%",
    height: 70,
    backgroundColor: "#007bff",
    justifyContent: "center",
    alignItems: "center",
    marginVertical: 10,
    borderRadius: 10,
  },
  buttonText: {
    color: "white",
    fontSize: 18,
  },
});
