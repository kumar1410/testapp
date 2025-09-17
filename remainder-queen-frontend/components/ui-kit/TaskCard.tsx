import { Avatar, Card, Text } from "@ui-kitten/components";
import React, { useRef } from "react";
import { Animated, StyleSheet, View } from "react-native";

export interface TaskCardProps {
  id: number;
  title: string;
  description: string;
  user: string;
  time: string;
  color: string;
  completed?: boolean;
  onPress?: (id: number) => void;
}

const styles = StyleSheet.create({
  card: {
    marginVertical: 8,
    // borderLeftWidth: 4,
    borderRadius: 8,
    padding: 8,
    backgroundColor: "#fff",
  },
  row: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
  },
  content: {
    flex: 1,
    marginRight: 8,
  },
  userRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  avatar: {
    marginRight: 6,
  },
  user: {
    fontSize: 12,
  },
  time: {
    fontSize: 12,
    alignSelf: "flex-start",
  },
  inner: {
    borderLeftWidth: 6,
    paddingLeft: 8,
  },
});

export const TaskCard: React.FC<TaskCardProps> = ({
  id,
  title,
  description,
  user,
  time,
  color,
  completed,
  onPress,
}) => {
  const scale = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scale, {
      toValue: 0.97,
      useNativeDriver: true,
      friction: 4,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scale, {
      toValue: 1,
      useNativeDriver: true,
      friction: 4,
    }).start();
  };

  return (
    <Animated.View style={{ transform: [{ scale }], marginVertical: 8 }}>
      <Card
        style={[
          styles.card,
          { borderLeftColor: color, borderLeftWidth: 6, borderStyle: "solid" },
        ]}
        status="basic"
        onPress={() => onPress?.(id)}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
      >
        <View style={styles.row}>
          <View style={styles.content}>
            <Text category="s1">{title}</Text>
            <Text appearance="hint" numberOfLines={1}>
              {description}
            </Text>
            <View style={styles.userRow}>
              <Avatar size="tiny" style={styles.avatar} />
              <Text appearance="hint" style={styles.user}>
                {user}
              </Text>
            </View>
          </View>
          <Text appearance="hint" style={styles.time}>
            {time}
          </Text>
        </View>
      </Card>
    </Animated.View>
  );
};
