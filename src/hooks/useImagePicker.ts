import { useState, useCallback } from 'react';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import { Alert } from 'react-native';

const MAX_IMAGE_SIZE = 1024;

export function useImagePicker() {
  const [image, setImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const processImage = useCallback(async (uri: string): Promise<string> => {
    const manipulated = await ImageManipulator.manipulateAsync(
      uri,
      [{ resize: { width: MAX_IMAGE_SIZE } }],
      { compress: 0.8, format: ImageManipulator.SaveFormat.PNG }
    );
    return manipulated.uri;
  }, []);

  const pickFromGallery = useCallback(async () => {
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        Alert.alert('Permission Required', 'Please allow access to your photo library.');
        return;
      }

      setIsLoading(true);
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        const processed = await processImage(result.assets[0].uri);
        setImage(processed);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick image from gallery.');
    } finally {
      setIsLoading(false);
    }
  }, [processImage]);

  const pickFromCamera = useCallback(async () => {
    try {
      const permission = await ImagePicker.requestCameraPermissionsAsync();
      if (!permission.granted) {
        Alert.alert('Permission Required', 'Please allow access to your camera.');
        return;
      }

      setIsLoading(true);
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        const processed = await processImage(result.assets[0].uri);
        setImage(processed);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to capture image from camera.');
    } finally {
      setIsLoading(false);
    }
  }, [processImage]);

  const clearImage = useCallback(() => {
    setImage(null);
  }, []);

  return { image, isLoading, pickFromGallery, pickFromCamera, clearImage };
}
