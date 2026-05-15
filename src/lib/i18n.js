import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

const resources = {
  en: {
    translation: {
      // App
      appName: 'ReviewBoost',
      tagline: 'Turn happy customers into 5-star reviews',
      
      // Nav
      dashboard: 'Dashboard',
      login: 'Login',
      signup: 'Sign Up',
      logout: 'Logout',
      settings: 'Settings',
      
      // Auth
      email: 'Email',
      password: 'Password',
      businessName: 'Business Name',
      googleReviewUrl: 'Google Review URL',
      createAccount: 'Create Account',
      signIn: 'Sign In',
      noAccount: "Don't have an account?",
      haveAccount: 'Already have an account?',
      forgotPassword: 'Forgot password?',
      
      // Landing / Review page
      howWasYourExperience: 'How was your experience?',
      tapToRate: 'Tap a star to rate us',
      shareOnGoogle: 'Share your review on Google',
      keepPrivate: 'Share private feedback',
      yourName: 'Your name (optional)',
      yourFeedback: 'Tell us what we can improve...',
      submitFeedback: 'Submit Feedback',
      feedbackThankYou: 'Thank you for your feedback!',
      feedbackReceived: 'We value your input and will use it to improve.',
      
      // Review suggestions
      reviewSuggestions: 'AI-Suggested Reviews',
      suggestionSubtitle: 'Pick one, customize it, then post to Google!',
      copyReview: 'Copy Review',
      openGoogle: 'Open Google Review',
      copied: 'Copied!',
      copyAndOpen: 'Copy & Open Google',
      
      // Dashboard
      totalScans: 'Total Scans',
      totalRatings: 'Total Ratings',
      averageRating: 'Average Rating',
      recentActivity: 'Recent Activity',
      yourQRCode: 'Your QR Code',
      downloadQR: 'Download QR Code',
      shareQR: 'Share QR Code',
      qrInstructions: 'Display this QR code at your checkout, reception, or table.',
      
      // Analytics
      ratingsOverTime: 'Ratings Over Time',
      ratingDistribution: 'Rating Distribution',
      last30Days: 'Last 30 Days',
      noDataYet: 'No data yet',
      startGettingReviews: 'Start collecting reviews to see analytics.',
      
      // Settings
      businessSettings: 'Business Settings',
      updateProfile: 'Update Profile',
      saveChanges: 'Save Changes',
      profileUpdated: 'Profile updated!',
      
      // Stars
      star1: 'Terrible',
      star2: 'Bad',
      star3: 'Okay',
      star4: 'Good',
      star5: 'Excellent!',
      
      // General
      loading: 'Loading...',
      error: 'Something went wrong',
      tryAgain: 'Try again',
      poweredBy: 'Powered by ReviewBoost',
      language: 'Language',
      theme: 'Theme',
      darkMode: 'Dark Mode',
      lightMode: 'Light Mode',
      
      // Feedback Form
      feedbackLabel: 'We\'re sorry to hear that. Please tell us more:',
      sendFeedback: 'Send Feedback',
      feedbackSent: 'Feedback sent! Thank you.',
    }
  },

  gu: {
    translation: {
      appName: 'ReviewBoost',
      tagline: 'ખુશ ગ્રાહકોને 5-સ્ટાર સમીક્ષામાં ફેરવો',

      dashboard: 'ડેશબોર્ડ',
      login: 'લૉગ ઇન',
      signup: 'સાઇન અપ',
      logout: 'લૉગ આઉટ',
      settings: 'સેટિંગ્સ',

      email: 'ઈ-મેઈલ',
      password: 'પાસવર્ડ',
      businessName: 'વ્યવસાયનું નામ',
      googleReviewUrl: 'Google સમીક્ષા URL',
      createAccount: 'એકાઉન્ટ બનાવો',
      signIn: 'સાઇન ઇન',
      noAccount: 'એકાઉન્ટ નથી?',
      haveAccount: 'પહેલેથી એકાઉન્ટ છે?',
      forgotPassword: 'પાસવર્ડ ભૂલ્યા?',

      howWasYourExperience: 'તમારો અનુભવ કેવો હતો?',
      tapToRate: 'અમને રેટ કરવા માટે સ્ટાર ટેપ કરો',
      shareOnGoogle: 'Google પર સમીક્ષા શેર કરો',
      keepPrivate: 'ખાનગી પ્રતિસાદ',
      yourName: 'તમારું નામ (વૈકલ્પિક)',
      yourFeedback: 'અમે શું સુધારી શકીએ તે જણાવો...',
      submitFeedback: 'પ્રતિસાદ સબમિટ કરો',
      feedbackThankYou: 'આભાર!',
      feedbackReceived: 'અમે તમારો ઇનપુટ સ્વીકારીએ છીએ.',

      reviewSuggestions: 'AI-સૂચિત સમીક્ષાઓ',
      suggestionSubtitle: 'એક પસંદ કરો, ફેરફાર કરો, પછી Google પર પોસ્ટ કરો!',
      copyReview: 'સમીક્ષા કૉપિ કરો',
      openGoogle: 'Google સમીક્ષા ખોલો',
      copied: 'કૉપિ!',
      copyAndOpen: 'કૉપિ અને Google ખોલો',

      totalScans: 'કુલ સ્કૅન',
      totalRatings: 'કુલ રેટિંગ',
      averageRating: 'સરેરાશ રેટિંગ',
      recentActivity: 'તાજેતરની પ્રવૃત્તિ',
      yourQRCode: 'તમારો QR કોડ',
      downloadQR: 'QR ડાઉનલોડ',
      shareQR: 'QR શેર કરો',
      qrInstructions: 'આ QR કોડ ચેકઆઉટ, રિસેપ્શન અથવા ટેબલ પર પ્રદર્શિત કરો.',

      ratingsOverTime: 'સમય સાથે રેટિંગ',
      ratingDistribution: 'રેટિંગ વિતરણ',
      last30Days: 'છેલ્લા 30 દિવસ',
      noDataYet: 'હજી ડેટા નથી',
      startGettingReviews: 'Analytics જોવા માટે સમીક્ષા એકત્ર કરવાનું શરૂ કરો.',

      businessSettings: 'વ્યવસાય સેટિંગ્સ',
      updateProfile: 'પ્રોફાઇલ અપડેટ',
      saveChanges: 'ફેરફારો સાચવો',
      profileUpdated: 'પ્રોફાઇલ અપડેટ!',

      star1: 'ખૂબ ખરાબ',
      star2: 'ખરાબ',
      star3: 'ઠીક',
      star4: 'સારું',
      star5: 'ઉત્તમ!',

      loading: 'લોડ...',
      error: 'ભૂલ',
      tryAgain: 'ફરી પ્રયત્ન',
      poweredBy: 'ReviewBoost દ્વારા',
      language: 'ભાષા',
      theme: 'થીમ',
      darkMode: 'ડાર્ક મોડ',
      lightMode: 'લાઇટ મોડ',

      feedbackLabel: 'કૃપા કરીને વધુ જણાવો:',
      sendFeedback: 'પ્રતિસાદ મોકલો',
      feedbackSent: 'પ્રતિસાદ મોકલ્યો! આભાર.',
    }
  },

  hi: {
    translation: {
      appName: 'ReviewBoost',
      tagline: 'खुश ग्राहकों को 5-स्टार समीक्षाओं में बदलें',

      dashboard: 'डैशबोर्ड',
      login: 'लॉगिन',
      signup: 'साइन अप',
      logout: 'लॉग आउट',
      settings: 'सेटिंग्स',

      email: 'ईमेल',
      password: 'पासवर्ड',
      businessName: 'व्यवसाय का नाम',
      googleReviewUrl: 'Google समीक्षा URL',
      createAccount: 'खाता बनाएं',
      signIn: 'साइन इन',
      noAccount: 'खाता नहीं है?',
      haveAccount: 'पहले से खाता है?',
      forgotPassword: 'पासवर्ड भूल गए?',

      howWasYourExperience: 'आपका अनुभव कैसा था?',
      tapToRate: 'हमें रेट करने के लिए स्टार टैप करें',
      shareOnGoogle: 'Google पर समीक्षा शेयर करें',
      keepPrivate: 'निजी प्रतिक्रिया',
      yourName: 'आपका नाम (वैकल्पिक)',
      yourFeedback: 'बताएं हम क्या सुधार सकते हैं...',
      submitFeedback: 'प्रतिक्रिया सबमिट करें',
      feedbackThankYou: 'धन्यवाद!',
      feedbackReceived: 'हम आपका सुझाव महत्व देते हैं।',

      reviewSuggestions: 'AI-सुझावित समीक्षाएं',
      suggestionSubtitle: 'एक चुनें, अनुकूलित करें, फिर Google पर पोस्ट करें!',
      copyReview: 'समीक्षा कॉपी करें',
      openGoogle: 'Google समीक्षा खोलें',
      copied: 'कॉपी!',
      copyAndOpen: 'कॉपी करें और Google खोलें',

      totalScans: 'कुल स्कैन',
      totalRatings: 'कुल रेटिंग',
      averageRating: 'औसत रेटिंग',
      recentActivity: 'हाल की गतिविधि',
      yourQRCode: 'आपका QR कोड',
      downloadQR: 'QR डाउनलोड',
      shareQR: 'QR शेयर करें',
      qrInstructions: 'यह QR कोड चेकआउट, रिसेप्शन या टेबल पर प्रदर्शित करें।',

      ratingsOverTime: 'समय के साथ रेटिंग',
      ratingDistribution: 'रेटिंग वितरण',
      last30Days: 'पिछले 30 दिन',
      noDataYet: 'अभी डेटा नहीं',
      startGettingReviews: 'Analytics देखने के लिए समीक्षाएं एकत्र करना शुरू करें।',

      businessSettings: 'व्यवसाय सेटिंग्स',
      updateProfile: 'प्रोफ़ाइल अपडेट',
      saveChanges: 'परिवर्तन सहेजें',
      profileUpdated: 'प्रोफ़ाइल अपडेट!',

      star1: 'बहुत खराब',
      star2: 'खराब',
      star3: 'ठीक',
      star4: 'अच्छा',
      star5: 'शानदार!',

      loading: 'लोड हो रहा है...',
      error: 'कुछ गलत हुआ',
      tryAgain: 'पुनः प्रयास',
      poweredBy: 'ReviewBoost द्वारा संचालित',
      language: 'भाषा',
      theme: 'थीम',
      darkMode: 'डार्क मोड',
      lightMode: 'लाइट मोड',

      feedbackLabel: 'कृपया और बताएं:',
      sendFeedback: 'प्रतिक्रिया भेजें',
      feedbackSent: 'प्रतिक्रिया भेजी! धन्यवाद।',
    }
  }
}

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: localStorage.getItem('lang') || 'en',
    fallbackLng: 'en',
    interpolation: { escapeValue: false },
  })

export default i18n
