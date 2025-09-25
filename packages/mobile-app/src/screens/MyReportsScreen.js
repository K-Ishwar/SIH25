import React, { useState, useCallback, useContext } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, RefreshControl } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

// NOTE: For development, replace with your local IP address.
const API_URL = 'http://localhost:3001/api';

const MyReportsScreen = () => {
  const { userToken } = useContext(AuthContext);
  const [reports, setReports] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchReports = async () => {
    try {
      const response = await axios.get(`${API_URL}/reports/my-reports`, {
        headers: { 'x-auth-token': userToken },
      });
      setReports(response.data);
    } catch (error) {
      console.error(error.response?.data || error.message);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      setIsLoading(true);
      fetchReports();
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchReports();
  };

  const renderItem = ({ item }) => (
    <View style={styles.reportItem}>
      <Text style={styles.reportTitle}>{item.title}</Text>
      <Text style={styles.reportStatus}>Status: {item.status}</Text>
      <Text style={styles.reportDate}>
        {new Date(item.created_at).toLocaleDateString()}
      </Text>
    </View>
  );

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <FlatList
      data={reports}
      renderItem={renderItem}
      keyExtractor={(item) => item.id.toString()}
      style={styles.container}
      ListEmptyComponent={<Text style={styles.emptyText}>You have not submitted any reports.</Text>}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    />
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  reportItem: {
    backgroundColor: 'white',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  reportTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  reportStatus: {
    fontSize: 14,
    color: 'gray',
    marginTop: 5,
  },
  reportDate: {
    fontSize: 12,
    color: 'gray',
    marginTop: 5,
    textAlign: 'right',
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 50,
    fontSize: 16,
  }
});

export default MyReportsScreen;