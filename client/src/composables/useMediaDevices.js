import { onBeforeUnmount, ref, shallowRef } from "vue";

const getErrorMessage = (error) => {
  if (error?.name === "NotAllowedError") {
    return "Camera/microphone permission was denied. Please allow access and try again.";
  }

  if (error?.name === "NotFoundError") {
    return "No camera or microphone was found on this device.";
  }

  return "Unable to access camera and microphone right now.";
};

export const useMediaDevices = () => {
  const localStream = shallowRef(null);
  const hasMediaPermission = ref(false);
  const isRequestingPermission = ref(false);
  const mediaError = ref("");
  const micEnabled = ref(true);
  const cameraEnabled = ref(true);

  const stopTracks = (stream) => {
    stream?.getTracks().forEach((track) => {
      track.stop();
    });
  };

  const syncTrackFlags = () => {
    const audioTracks = localStream.value?.getAudioTracks() || [];
    const videoTracks = localStream.value?.getVideoTracks() || [];

    micEnabled.value = audioTracks.length ? audioTracks.every((track) => track.enabled) : false;
    cameraEnabled.value = videoTracks.length ? videoTracks.every((track) => track.enabled) : false;
  };

  const requestPermissions = async () => {
    isRequestingPermission.value = true;
    mediaError.value = "";

    try {
      const nextStream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: true,
      });

      stopTracks(localStream.value);
      localStream.value = nextStream;
      hasMediaPermission.value = true;
      syncTrackFlags();

      return true;
    } catch (error) {
      hasMediaPermission.value = false;
      mediaError.value = getErrorMessage(error);
      return false;
    } finally {
      isRequestingPermission.value = false;
    }
  };

  const toggleTrack = (kind) => {
    const stream = localStream.value;

    if (!stream) {
      return false;
    }

    const tracks = kind === "audio" ? stream.getAudioTracks() : stream.getVideoTracks();

    if (!tracks.length) {
      return false;
    }

    const nextEnabled = !tracks.every((track) => track.enabled);
    tracks.forEach((track) => {
      track.enabled = nextEnabled;
    });
    syncTrackFlags();

    return nextEnabled;
  };

  const toggleMicrophone = () => toggleTrack("audio");
  const toggleCamera = () => toggleTrack("video");

  const stopLocalStream = () => {
    stopTracks(localStream.value);
    localStream.value = null;
    hasMediaPermission.value = false;
  };

  onBeforeUnmount(() => {
    stopLocalStream();
  });

  return {
    cameraEnabled,
    hasMediaPermission,
    isRequestingPermission,
    localStream,
    mediaError,
    micEnabled,
    requestPermissions,
    stopLocalStream,
    toggleCamera,
    toggleMicrophone,
  };
};
