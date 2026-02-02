import {Platform, PermissionsAndroid, Alert, Linking} from 'react-native';

export const requestPhoneCallPermission = async (): Promise<boolean> => {
  if (Platform.OS !== 'android') return true;

  try {
    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.CALL_PHONE,
      {
        title: 'Phone Call Permission',
        message: 'This app needs access to make phone calls to your leads.',
        buttonNeutral: 'Ask Me Later',
        buttonNegative: 'Cancel',
        buttonPositive: 'OK',
      },
    );
    return granted === PermissionsAndroid.RESULTS.GRANTED;
  } catch (err) {
    console.warn(err);
    return false;
  }
};

export const requestContactsPermission = async (): Promise<boolean> => {
  if (Platform.OS !== 'android') return true;

  try {
    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.READ_CONTACTS,
      {
        title: 'Contacts Permission',
        message: 'This app needs access to read your contacts.',
        buttonNeutral: 'Ask Me Later',
        buttonNegative: 'Cancel',
        buttonPositive: 'OK',
      },
    );
    return granted === PermissionsAndroid.RESULTS.GRANTED;
  } catch (err) {
    console.warn(err);
    return false;
  }
};

export const requestStoragePermission = async (): Promise<boolean> => {
  if (Platform.OS !== 'android') return true;

  try {
    const androidVersion = Platform.Version as number;
    
    // Android 13+ uses granular media permissions
    if (androidVersion >= 33) {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES,
        {
          title: 'Media Permission',
          message: 'This app needs access to your media files.',
          buttonNeutral: 'Ask Me Later',
          buttonNegative: 'Cancel',
          buttonPositive: 'OK',
        },
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    } else {
      // Android 12 and below
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
        {
          title: 'Storage Permission',
          message: 'This app needs access to your storage.',
          buttonNeutral: 'Ask Me Later',
          buttonNegative: 'Cancel',
          buttonPositive: 'OK',
        },
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    }
  } catch (err) {
    console.warn(err);
    return false;
  }
};

export const showPermissionDeniedAlert = (permissionName: string) => {
  Alert.alert(
    'Permission Required',
    `${permissionName} permission is required for this feature. Please enable it in app settings.`,
    [
      {text: 'Cancel', style: 'cancel'},
      {text: 'Open Settings', onPress: () => Linking.openSettings()},
    ],
  );
};

export const makePhoneCall = async (phoneNumber: string) => {
  const hasPermission = await requestPhoneCallPermission();
  
  if (!hasPermission) {
    showPermissionDeniedAlert('Phone Call');
    return;
  }

  const url = `tel:${phoneNumber}`;
  const canOpen = await Linking.canOpenURL(url);
  
  if (canOpen) {
    await Linking.openURL(url);
  } else {
    Alert.alert('Error', 'Unable to make phone call');
  }
};

export const openWhatsApp = async (phoneNumber: string, message?: string) => {
  const cleanNumber = phoneNumber.replace(/[^0-9]/g, '');
  const url = message 
    ? `whatsapp://send?phone=${cleanNumber}&text=${encodeURIComponent(message)}`
    : `whatsapp://send?phone=${cleanNumber}`;
  
  const canOpen = await Linking.canOpenURL(url);
  
  if (canOpen) {
    await Linking.openURL(url);
  } else {
    Alert.alert('Error', 'WhatsApp is not installed');
  }
};
