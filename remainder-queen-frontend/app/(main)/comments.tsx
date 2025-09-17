import { AppIcon } from '@/components/ui-kit/AppIcon';
import { Input, Layout, Text } from '@ui-kitten/components';
import React from 'react';
import { StyleSheet, View } from 'react-native';

const dummyComments = [
  {
    id: 1,
    text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. In viverra viverra eget interdum adipiscing.',
    time: '04:30 PM',
    sent: true,
  },
  {
    id: 2,
    text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. In viverra viverra eget interdum adipiscing.',
    time: '04:40 PM',
    sent: false,
  },
];

export default function CommentsScreen() {
  const [message, setMessage] = React.useState('');

  return (
    <Layout style={styles.container}>
      <Text category="h6" style={styles.title}>File GST & IT Return</Text>
      <View style={styles.tabRow}>
        <Text style={[styles.tab, styles.activeTab]}>Comments</Text>
      </View>
      <View style={styles.commentsContainer}>
        {dummyComments.map(comment => (
          <View key={comment.id} style={[styles.commentBubble, comment.sent ? styles.sent : styles.received]}>
            <Text>{comment.text}</Text>
            <Text appearance="hint" style={styles.time}>{comment.time}</Text>
          </View>
        ))}
      </View>
      <View style={styles.inputRow}>
        <Input
          placeholder="Type Message"
          value={message}
          onChangeText={setMessage}
          style={styles.input}
        />
        <AppIcon name="arrow-upward" style={styles.sendIcon} />
      </View>
    </Layout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#F7F9FC',
  },
  title: {
    marginBottom: 8,
  },
  tabRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  tab: {
    fontWeight: 'bold',
    marginRight: 16,
    fontSize: 16,
  },
  activeTab: {
    color: '#3D5AFE',
    borderBottomWidth: 2,
    borderBottomColor: '#3D5AFE',
    paddingBottom: 4,
  },
  commentsContainer: {
    flex: 1,
    marginBottom: 8,
  },
  commentBubble: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    maxWidth: '80%',
  },
  sent: {
    backgroundColor: '#E3F2FD',
    alignSelf: 'flex-end',
  },
  received: {
    backgroundColor: '#FFF3E0',
    alignSelf: 'flex-start',
  },
  time: {
    fontSize: 10,
    marginTop: 4,
    alignSelf: 'flex-end',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    flex: 1,
  },
  sendIcon: {
    width: 32,
    height: 32,
    marginLeft: 8,
    tintColor: '#3D5AFE',
  },
});
