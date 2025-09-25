import React, { useState, useEffect, useContext } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Image, Alert, ScrollView, PermissionsAndroid, Platform } from 'react-native';
import { launchImagePicker } from 'react-native-image-picker';
import Geolocation from 'react-native-geolocation-service';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

// NOTE: For development, replace with your local IP address.
const API_URL = 'http://localhost:3001/api';

const SubmitReportScreen = ({ navigation }) => {
  const { userToken } = useContext(AuthContext);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [photo, setPhoto] = useState(null);
  const [location, setLocation] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    requestLocationPermission();
  }, []);

  const requestLocationPermission = async () => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: 'Location Permission',
            message: 'This app needs access to your location to tag the issue.',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          },
        );
        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
          getCurrentLocation();
        } else {
          Alert.alert('Permission Denied', 'Location permission is required to submit a report.');
        }
      } catch (err) {
        console.warn(err);
      }
    } else {
        // For iOS, permission is requested when Geolocation.getCurrentPosition is called.
        getCurrentLocation();
    }
  };

  const getCurrentLocation = () => {
    Geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      },
      (error) => {
        Alert.alert('Could not get location', error.message);
        console.log(error.code, error.message);
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
    );
  };

  const handleChoosePhoto = () => {
    launchImagePicker({ mediaType: 'photo' }, (response) => {
      if (response.didCancel) {
        console.log('User cancelled image picker');
      } else if (response.errorCode) {
        console.log('ImagePicker Error: ', response.errorMessage);
      } else {
        if (response.assets && response.assets.length > 0) {
            setPhoto(response.assets[0]);
        }
      }
    });
  };

  const handleSubmit = async () => {
    if (!title || !description || !photo || !location) {
      Alert.alert('Missing Information', 'Please fill out all fields, add a photo, and ensure location is enabled.');
      return;
    }
    setIsSubmitting(true);
    const formData = new FormData();
    formData.append('title', title);
    formData.append('description', description);
    formData.append('latitude', location.latitude);
    formData.append('longitude', location.longitude);
    formData.append('photo', {
      uri: photo.uri,
      type: photo.type,
      name: photo.fileName || 'report.jpg',
    });

    try {
      await axios.post(`${API_URL}/reports`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'x-auth-token': userToken, // Auth header should be set by context, but we add it here for clarity
        },
      });
      Alert.alert('Success', 'Report submitted successfully!', [
        { text: 'OK', onPress: () => navigation.navigate('Home') }
      ]);
      // Reset form
      setTitle('');
      setDescription('');
      setPhoto(null);
    } catch (error) {
      console.error(error.response?.data || error.message);
      Alert.alert('Submission Failed', error.response?.data?.message || 'An error occurred.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Submit a New Report</Text>
      <TextInput
        style={styles.input}
        placeholder="Report Title"
        value={title}
        onChangeText={setTitle}
      />
      <TextInput
        style={[styles.input, styles.textArea]}
        placeholder="Describe the issue"
        value={description}
        onChangeText={setDescription}
        multiline
      />
      <View style={styles.photoContainer}>
        {photo ? (
          <Image source={{ uri: photo.uri }} style={styles.photo} />
        ) : (
          <Text>No photo selected</Text>
        )}
      </View>
      <Button title="Choose Photo" onPress={handleChoosePhoto} />

      {location && (
          <Text style={styles.locationText}>
              Location Captured: {location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}
          </Text>
      )}

      <View style={styles.submitButton}>
        <Button title={isSubmitting ? "Submitting..." : "Submit Report"} onPress={handleSubmit} disabled={isSubmitting} />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
    container: {
      padding: 20,
    },
    title: {
      fontSize: 24,
      fontWeight: 'bold',
      marginBottom: 20,
      textAlign: 'center',
    },
    input: {
      height: 40,
      borderColor: 'gray',
      borderWidth: 1,
      marginBottom: 12,
      paddingHorizontal: 8,
    },
    textArea: {
        height: 100,
        textAlignVertical: 'top',
    },
    photoContainer: {
        alignItems: 'center',
        marginVertical: 20,
    },
    photo: {
        width: 200,
        height: 200,
    },
    locationText: {
        textAlign: 'center',
        marginVertical: 10,
        color: 'gray',
    },
    submitButton: {
        marginTop: 20,
    }
  });

export default SubmitReportScreen;