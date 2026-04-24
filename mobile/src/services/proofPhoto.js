import * as ImagePicker from 'expo-image-picker';

const IMAGE_PICKER_OPTIONS = {
  mediaTypes: ['images'],
  allowsEditing: true,
  aspect: [4, 3],
  quality: 0.35,
  base64: true,
};

function buildProofPhotoFromAsset(asset, source) {
  if (!asset?.base64) {
    return null;
  }

  const mimeType = asset.mimeType || 'image/jpeg';
  return {
    uri: `data:${mimeType};base64,${asset.base64}`,
    capturedAt: new Date().toISOString(),
    source,
    mimeType,
  };
}

async function ensureCameraPermission() {
  const permission = await ImagePicker.requestCameraPermissionsAsync();
  return permission.granted;
}

async function ensureLibraryPermission() {
  const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
  return permission.granted;
}

export async function captureProofPhoto() {
  const hasPermission = await ensureCameraPermission();
  if (!hasPermission) {
    throw new Error('Permissão da câmera não concedida.');
  }

  const result = await ImagePicker.launchCameraAsync(IMAGE_PICKER_OPTIONS);
  if (result.canceled) {
    return null;
  }

  return buildProofPhotoFromAsset(result.assets?.[0], 'camera');
}

export async function pickProofPhoto() {
  const hasPermission = await ensureLibraryPermission();
  if (!hasPermission) {
    throw new Error('Permissão da galeria não concedida.');
  }

  const result = await ImagePicker.launchImageLibraryAsync(IMAGE_PICKER_OPTIONS);
  if (result.canceled) {
    return null;
  }

  return buildProofPhotoFromAsset(result.assets?.[0], 'library');
}
