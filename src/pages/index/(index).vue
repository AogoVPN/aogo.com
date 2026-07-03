<template>
  <q-page class="vpn-page">
    <div class="header">
      <div class="logo-container">
        <img alt="Logo" src="~@/assets/logo.png" class="logo" />
        <span class="logo-text">AogoVPN</span>
      </div>
      <q-select
        rounded
        outlined
        v-model="currentLocale"
        :options="languageOptions"
        class="language-select"
        dark
        dense
        emit-value
        map-options
        behavior="menu"
      />
    </div>

    <div class="main-content">
      <div class="slogan text-h5">
        {{ $t("slogan") }}
      </div>

      <div class="poster-container">
        <img
          ref="posterRef"
          alt="Poster"
          src="~@/assets/image.png"
          class="poster"
          @load="onPosterLoad"
        />
        <VueLottiePlayer
          class="lottie-overlay-left"
          :animation-data="switchJson"
          :autoplay="true"
          :loop="true"
          :width="lottieSize"
          :height="lottieSize"
        />
        <VueLottiePlayer
          class="lottie-overlay-right"
          :animation-data="switchJson"
          :autoplay="true"
          :loop="true"
          :width="lottieSize"
          :height="lottieSize"
        />
      </div>

      <div class="download-section">
        <q-btn
          class="download-btn download-android"
          size="lg"
          :label="$t('downloadAndroid')"
          no-caps
          icon="android"
          @click="downloadAndroid"
          :disabled="!vpnStore.hasActiveServer || vpnStore.isChecking"
          :loading="vpnStore.isChecking"
        />
        <q-btn
          class="download-btn download-ios"
          size="lg"
          :label="$t('downloadIos')"
          no-caps
          icon="iphone"
          @click="downloadIos"
          :disabled="!vpnStore.hasActiveServer || vpnStore.isChecking"
          :loading="vpnStore.isChecking"
        />
        <q-btn
          class="download-btn download-windows"
          size="lg"
          :label="$t('downloadWindows')"
          no-caps
          icon="windows"
          @click="downloadWindows"
          :disabled="!vpnStore.hasActiveServer || vpnStore.isChecking"
          :loading="vpnStore.isChecking"
        />
        <q-btn
          class="download-btn download-mac"
          size="lg"
          :label="$t('downloadMac')"
          no-caps
          icon="apple"
          @click="downloadMac"
          :disabled="!vpnStore.hasActiveServer || vpnStore.isChecking"
          :loading="vpnStore.isChecking"
        />
      </div>

      <div class="social-section">
        <p class="social-title">{{ $t("socialMediaTitle") }}</p>
        <div class="social-links">
          <a
            href="https://twitter.com/aogovpn"
            target="_blank"
            class="social-link social-twitter"
          >
            <span class="social-icon-wrapper">🐦</span>
            <span class="social-url">{{ $t("twitterLink") }}</span>
          </a>

          <a
            href="https://t.me/aogovpn"
            target="_blank"
            class="social-link social-telegram"
          >
            <span class="social-icon-wrapper">💬</span>
            <span class="social-url">{{ $t("telegramLink") }}</span>
          </a>
        </div>
      </div>
    </div>

    <div class="footer">
      <p>{{ $t("copyright") }}</p>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted, nextTick } from "vue";
import { useI18n } from "vue-i18n";
import switchJson from "@/assets/switch.json";
import { useVpnStore } from "@/stores/store";

const { locale } = useI18n();
const vpnStore = useVpnStore();

const getBrowserLanguage = (): string => {
  const browserLang = navigator.language || "zh-CN";
  const availableLangs = ["en-US", "zh-CN", "zh-TW"];
  const langPrefix = browserLang.split("-")[0];

  if (availableLangs.includes(browserLang)) {
    return browserLang;
  }

  if (langPrefix === "zh") {
    return "zh-CN";
  }

  return "zh-CN";
};

const currentLocale = ref(getBrowserLanguage());
const lottieSize = ref(160);
const posterRef = ref<HTMLImageElement | null>(null);

const languageOptions = [
  { label: "🌐 English", value: "en-US" },
  { label: "🌐 简体中文", value: "zh-CN" },
  { label: "🌐 繁體中文", value: "zh-TW" },
];

watch(currentLocale, (newVal) => {
  locale.value = newVal;
});

const updateLottieSize = () => {
  if (posterRef.value) {
    const posterWidth = posterRef.value.offsetWidth;
    if (posterWidth > 0) {
      lottieSize.value = Math.round(posterWidth * 0.2);
    }
  }
};

const onPosterLoad = () => {
  updateLottieSize();
};

const downloadAndroid = () => {
  const url = vpnStore.getDownloadUrl("android");
  if (url) {
    window.open(url, "_blank");
  }
};

const downloadWindows = () => {
  const url = vpnStore.getDownloadUrl("windows");
  if (url) {
    window.open(url, "_blank");
  }
};

const downloadMac = () => {
  const url = vpnStore.getDownloadUrl("macos");
  if (url) {
    window.open(url, "_blank");
  }
};

const downloadIos = () => {
  // iOS OTA installation requires the itms-services URL scheme pointing to a manifest plist
  // Use location.href to trigger the installation on iOS devices
  window.location.href =
    "itms-services://?action=download-manifest&url=https://aogo.dpdns.org/ios.plist";
};

onMounted(() => {
  locale.value = currentLocale.value;
  nextTick(() => {
    updateLottieSize();
  });
  window.addEventListener("resize", updateLottieSize);

  Promise.all([vpnStore.getActiveServer(), vpnStore.fetchUpdateInfo()]).catch(
    () => {},
  );
});

onUnmounted(() => {
  window.removeEventListener("resize", updateLottieSize);
});
</script>

<style scoped>
.vpn-page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 40px;
}

.logo-container {
  display: flex;
  align-items: center;
  gap: 12px;
}

.logo {
  height: 50px;
  width: auto;
}

.logo-text {
  font-size: 24px;
  font-weight: bold;
  color: #ffffff;
}

.language-select {
  min-width: 120px;
}

.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 10px;
}

.slogan {
  text-align: center;
  margin-bottom: 10px;
  font-weight: bold;
  color: #ffffff;
  line-height: 1.2;
}

.poster-container {
  position: relative;
  display: inline-block;
  margin-bottom: 40px;
  overflow: hidden;
}

.poster {
  max-width: 100%;
  max-height: 60vh;
  border-radius: 16px;
  /* box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5); */
}

.lottie-overlay-left {
  position: absolute;
  top: 60%;
  left: 27%;
  transform: translate(-50%, -50%);
}

.lottie-overlay-right {
  position: absolute;
  top: 52%;
  left: 69%;
  transform: translate(-50%, -50%);
}

.download-section {
  display: flex;
  gap: 20px;
  flex-wrap: wrap;
  justify-content: center;
  margin-bottom: 40px;
}

.download-btn {
  padding: 16px 40px;
  font-size: 20px;
  border-radius: 32px;
  color: #ffffff;
}

.download-android {
  background: linear-gradient(135deg, #3ddc84 0%, #4caf50 100%) !important;
  box-shadow: 0 12px 36px rgba(76, 175, 80, 0.6);
}

.download-ios {
  background: linear-gradient(135deg, #d4d4d8 0%, #a1a1aa 100%) !important;
  color: #000000 !important;
  box-shadow: 0 12px 36px rgba(161, 161, 170, 0.6);
}

.download-windows {
  background: linear-gradient(135deg, #0078d4 0%, #00a8e8 100%) !important;
  box-shadow: 0 12px 36px rgba(0, 120, 212, 0.6);
}

.download-mac {
  background: linear-gradient(135deg, #1a1a1a 0%, #000000 100%) !important;
  box-shadow: 0 12px 36px rgba(0, 0, 0, 0.8);
}

.social-section {
  text-align: center;
  width: 100%;
  max-width: 450px;
}

.social-title {
  color: rgba(255, 255, 255, 0.8);
  font-size: 14px;
  margin-bottom: 16px;
  letter-spacing: 1px;
  text-transform: uppercase;
}

.social-links {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.social-link {
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 24px;
  padding: 14px 28px;
  text-decoration: none;
  color: #ffffff;
  font-size: 16px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.social-link:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.4);
}

.social-icon-wrapper {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  margin-right: 12px;
  font-size: 18px;
  transition: all 0.3s ease;
}

.social-twitter {
  background: linear-gradient(
    135deg,
    rgba(29, 155, 240, 0.15),
    rgba(29, 155, 240, 0.05)
  );
  border-color: rgba(29, 155, 240, 0.3);
}

.social-twitter:hover {
  background: linear-gradient(
    135deg,
    rgba(29, 155, 240, 0.3),
    rgba(29, 155, 240, 0.1)
  );
}

.social-twitter .social-icon-wrapper {
  background: rgba(29, 155, 240, 0.2);
}

.social-twitter:hover .social-icon-wrapper {
  background: rgba(29, 155, 240, 0.4);
}

.social-telegram {
  background: linear-gradient(
    135deg,
    rgba(0, 136, 204, 0.15),
    rgba(0, 136, 204, 0.05)
  );
  border-color: rgba(0, 136, 204, 0.3);
}

.social-telegram:hover {
  background: linear-gradient(
    135deg,
    rgba(0, 136, 204, 0.3),
    rgba(0, 136, 204, 0.1)
  );
}

.social-telegram .social-icon-wrapper {
  background: rgba(0, 136, 204, 0.2);
}

.social-telegram:hover .social-icon-wrapper {
  background: rgba(0, 136, 204, 0.4);
}

.social-website {
  background: linear-gradient(
    135deg,
    rgba(100, 200, 255, 0.15),
    rgba(100, 200, 255, 0.05)
  );
  border-color: rgba(100, 200, 255, 0.3);
}

.social-website:hover {
  background: linear-gradient(
    135deg,
    rgba(100, 200, 255, 0.3),
    rgba(100, 200, 255, 0.1)
  );
}

.social-website .social-icon-wrapper {
  background: rgba(100, 200, 255, 0.2);
}

.social-website:hover .social-icon-wrapper {
  background: rgba(100, 200, 255, 0.4);
}

.social-url {
  font-weight: 500;
  letter-spacing: 0.5px;
}

.footer {
  text-align: center;
  padding: 20px;
  color: rgba(255, 255, 255, 0.6);
  font-size: 14px;
}

.footer p {
  margin: 0;
}

@media (max-width: 600px) {
  .header {
    padding: 15px 20px;
  }

  .logo {
    height: 40px;
  }

  .slogan {
    font-size: 32px;
  }

  .poster-container {
    margin-bottom: 10px;
  }

  .poster {
    border-radius: 0px;
  }

  .download-btn {
    padding: 10px 30px;
    font-size: 16px;
  }

  .download-section {
    flex-direction: column;
    gap: 15px;
    margin-bottom: 30px;
  }

  .social-link {
    padding: 10px 20px;
    font-size: 14px;
  }
}
</style>
